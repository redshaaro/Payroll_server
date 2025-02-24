const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL, // Master DB
        },
    },
});

const prismaRead = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_REPLICA_URL, // Read Replica
        },
    },
});

module.exports = { prisma, prismaRead };
