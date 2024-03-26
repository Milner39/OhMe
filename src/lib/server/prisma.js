import { PrismaClient } from "@prisma/client"

global.prismaClient

const client = global.prismaClient || new PrismaClient()

if (process.env.NODE_ENV === "development") {
    global.prismaClient = client
}

export { client }