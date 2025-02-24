const { processExcelFile } = require("../services/excelService");
const { prismaRead } = require("../lib/prisma")
const path = require("path");
const fs = require('fs')

const ExcelJS = require("exceljs");

// const prisma = new PrismaClient();

const uploadFile = async (req, res) => {
  try {
    // Ensure that multer successfully handled the uploaded file
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ error: "No file was uploaded or file handling failed." });
    }

    // Get the uploaded file path
    const filePath = path.join(__dirname, "../uploads", req.file.filename);

     

    // Verify the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Uploaded file not found on the server." });
    }


    // Process the file and extract headers (assuming `processExcelFile` handles this)
    const data = processExcelFile(filePath);

    if (!data || data.length === 0) {
      return res.status(400).json({ error: "The uploaded file contains no data." });
    }

    // Extract the headers (excluding the first column)
    const headers = Object.keys(data[0]).slice(1);

    res.status(200).json({
      message: "File uploaded successfully.",
      file_id: req.file.filename, // Return the saved file name as the file_id
      headers,
    });
  } catch (error) {
    console.error("Error in uploadFile:", error);
    res.status(500).json({ error: error.message });
  }
};





const generateExcel = async (req, res) => {
  try {
    const slugs = await prismaRead.pr_element_inputs.findMany({ select: { slug: true } });
    const slugColumns = slugs.map(row => row.slug);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Define columns
    const columns = [
      { header: "person_number", key: "person_number", width: 15 },
      ...slugColumns.map((slug) => ({
        header: slug,
        key: slug, // Use the slug as the key directly
        width: 20,
      })),
    ];
    worksheet.columns = columns;

    // Add dummy data to prevent skipped columns
    const rowData = {
      person_number: "123456", // Example value for person_number
      ...slugColumns.reduce((acc, slug) => {
        acc[slug] = ""; // Add empty string as default value
        return acc;
      }, {}),
    };

    worksheet.addRow(rowData); // Add a row with dummy data

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=generated_excel.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating Excel file");
  }
};


module.exports = { generateExcel, uploadFile };
