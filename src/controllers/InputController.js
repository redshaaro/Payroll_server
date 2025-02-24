


const { prismaRead } = require("../lib/prisma")



const getInputs = async (req, res) => {
    try {
        const data = await prismaRead.pr_element_inputs.findMany({

            select: { id: true, slug: true }
        })
        const formattedData = data.map((item) => ({
            id: item.id.toString(), // Convert BigInt to string
            slug: item.slug
        }));
        
        res.status(200).json(formattedData)

    } catch (err) {
        res.status(500).json({ message: err })
        console.log(err)
    }

}

module.exports = { getInputs };
