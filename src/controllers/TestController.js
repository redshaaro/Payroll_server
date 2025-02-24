const path = require("path");
const fs = require("fs");
const { processExcelFile } = require("../services/excelService");
// const { PrismaClient } = require("@prisma/client");
const { prisma, prismaRead } = require("../lib/prisma")

// const prisma = new PrismaClient();

const getEntry = async (req, res) => {
    try {
        const data = await prismaRead.pr_element_entries.findMany({
            where: { period_id: 573 },
            select: { value: true }
        })
        res.status(200).json(data)
    } catch (err) {
        res.status(500).json({ message: err })
    }

}

module.exports = { getEntry };
