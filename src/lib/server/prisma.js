// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/instantiate-prisma-client
// Import `PrismaClient` class
import { PrismaClient } from "@prisma/client"

// Declare a `global.prismaClient` variable to prevent multiple instances
global.prismaClient

// Use `global.prismaClient` if it is declared or initialise one
const client = global.prismaClient || new PrismaClient()

// Set `global.prismaClient` if running in development mode
if (process.env.NODE_ENV === "development") {
    global.prismaClient = client
}

export { client }