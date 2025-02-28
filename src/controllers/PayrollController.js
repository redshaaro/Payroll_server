const { prismaRead } = require("../lib/prisma");

const getPayroll = async (req, res) => {
    try {
        const payrolls = await prismaRead.pr_payrolls.findMany({
            select: { id: true, name: true }
        });
        const formattedData = payrolls.map((item) => ({
            id: item.id.toString(), // Convert BigInt to string
            name: item.name
        }));
        res.status(200).json(formattedData)


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getPayroll };
