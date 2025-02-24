const path = require("path");
const fs = require("fs");
const { processExcelFile } = require("../services/excelService");
// const { PrismaClient } = require("@prisma/client");
const { prisma,prismaRead } = require("../lib/prisma")

// const prisma = new PrismaClient();

const submitEntry = async (req, res) => {
  try {
    const { file_id, period_id, retro, is_off_cycle, mapping } = req.body;

    // Ensure that mapping is provided and is an object
    if (!file_id || !period_id || !mapping || typeof mapping !== 'object') {
      return res.status(400).json({ error: "file_id, period_id, mapping (as an object), retro, and is_off_cycle are required." });
    }

    // Retrieve the file from the file system
    const filePath = path.join(__dirname, "../uploads", file_id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found." });
    }

    // Process the Excel file content
    const data = processExcelFile(filePath);

    if (!data || data.length === 0) {
      return res.status(500).json({ error: "The uploaded sheet has no data." });
    }

    // Pre-fetch required data for validation and lookup
    const [validSlugs, period, existingEntries, employees, payrollAssignments] = await Promise.all([
      prismaRead.pr_element_inputs.findMany({ select: { slug: true, id: true, element_id: true } }),
      prismaRead.pr_periods.findFirst({ where: { id: period_id }, select: { from: true, to: true } }),
      prismaRead.pr_element_entries.findMany({
        where: { period_id: BigInt(period_id) },
        select: { person_id: true, pr_element_input_id: true, period_id: true },
      }),
      prismaRead.hrc_employees.findMany({ select: { person_id: true, person_number: true } }),
      prismaRead.pr_payroll_assignment.findMany({
        select: {
          person_id: true,
          assignment_id: true,
          assignment_number: true,
          start_effective_date: true,
          end_effective_date: true,
          payroll_id: true,
        },
      }),
    ]);

    if (!period) {
      return res.status(400).json({ error: `Period with ID ${period_id} does not exist.` });
    }

    // Prepare lookup maps for faster access
    const validSlugMap = new Map(validSlugs.map((slug) => [slug.slug, slug]));

    const personMap = new Map(employees.map((emp) => [String(emp.person_number), emp.person_id]));
    const assignmentMap = new Map();
    payrollAssignments.forEach((assignment) => {
      if (!assignmentMap.has(assignment.person_id)) {
        assignmentMap.set(assignment.person_id, []);
      }
      assignmentMap.get(assignment.person_id).push(assignment);
    });

    const existingEntriesSet = new Set(
      existingEntries.map((entry) => `${entry.person_id}-${entry.pr_element_input_id}-${entry.period_id}`)
    );

    const periodStart = new Date(period.from);
    const periodEnd = new Date(period.to);

    const errors = [];
    const validRecords = [];

    for (const row of data) {
      try {
        const personNumber = row["person_number"];
        if (!personNumber) {
          throw new Error("Missing 'person_number' in uploaded data.");
        }

        const personId = personMap.get(String(personNumber));
        if (!personId) {
          throw new Error(`No person found with person_number: ${personNumber}`);
        }

        const assignments = assignmentMap.get(personId) || [];
        const validAssignment = assignments.find((assignment) => {
          const effectiveStartDate = new Date(assignment.start_effective_date);
          const effectiveEndDate = new Date(assignment.end_effective_date);
          return (
            effectiveStartDate <= periodStart &&
            effectiveEndDate >= periodEnd &&
            assignment.payroll_id
          );
        });

        if (!validAssignment) {
          throw new Error(
            `No valid assignment or payroll information for person_number: ${personNumber}`
          );
        }

        for (const [excelHeader, value] of Object.entries(row)) {
          if (excelHeader === "person_number" || !value) continue;

          // Check the mapping for this header
          const slugId = mapping[excelHeader];
          if (!slugId) {
            continue; // Skip if there's no mapping for this header
          }

          const slug = validSlugs.find((slug) => slug.id === BigInt(slugId));

          if (!slug) {
            errors.push({ person_number: row["person_number"], error: `Missing mapping for header: ${excelHeader}` });
            continue;  // Skip this record
          }

          const key = `${personId}-${slug.id}-${period_id}`;
          if (existingEntriesSet.has(key)) {
            errors.push({ person_number: row["person_number"], error: `Duplicate entry found for ${excelHeader} in this period.` });
            continue;  // Skip this record if it's a duplicate
          }

          const elementType = await prisma.pr_elements.findFirst({
            where: { id: slug.element_id },
            select: { type: true },
          });

          if (!elementType) {
            throw new Error(`Element type not found for element ID: ${slug.element_id}`);
          }

          validRecords.push({
            pr_element_id: BigInt(slug.element_id),
            assignment_id: validAssignment.assignment_id,
            period_id: BigInt(period_id),
            pr_element_type: elementType.type,
            pr_element_input_id: slug.id,
            file_id: file_id,
            assignment_number: validAssignment.assignment_number.toString(),
            person_id: personId,
            retro: Boolean(retro),
            is_off_cycle: Boolean(is_off_cycle),
            value: value.toString(),
            date: new Date(),
          });

          existingEntriesSet.add(key);
        }
      } catch (error) {
        errors.push({ person_number: row["person_number"], error: error.message });
      }
    }

    // Bulk insert valid records
    if (validRecords.length > 0) {
      await prisma.pr_element_entries.createMany({
        data: validRecords,
        skipDuplicates: true,
      });
    }
   

    res.status(200).json({
      message: "Processing completed",
      errors,
      insertedRecords: validRecords.length,
    });
  } catch (error) {
    console.error("Error in submitEntry:", error);
    res.status(500).json({ error: "Failed to process the data upload." });
  }
};
module.exports = { submitEntry };
