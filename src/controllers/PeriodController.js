const { prismaRead } = require("../lib/prisma");

const getPeriodsByPayrollName = async (req, res) => {
    try {
        const { payrollName } = req.query; // Get the payroll name from query parameters

        if (!payrollName) {
            return res.status(400).json({ message: "Payroll name is required." });
        }

        // Find payroll by name to get its ID
        const payroll = await prismaRead.pr_payrolls.findMany({
            where: { name: payrollName },
            select: { id: true, name: true }
        });

        if (!payroll) {
            return res.status(404).json({ message: "Payroll not found." });
        }

        // Fetch periods related to this payroll ID
        const periods = await prismaRead.pr_periods.findMany({
            where: { payroll_id: payroll.id },
            select: { id: true, name: true }
        });

        const formattedData = periods.map((item) => ({
            id: item.id.toString(), // Convert BigInt to string
            name: item.name
        }));

        res.status(200).json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getPeriodsByPayrollName };
