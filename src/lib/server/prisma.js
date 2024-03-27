// Import function to create prisma client
import { PrismaClient } from "@prisma/client"

// Declare a global prisma variable to prevent multiple instances
global.prismaClient

// Use the global prisma client if it exists or initalise one
const client = global.prismaClient || new PrismaClient()

// Set the global prisma client if running in development mode
if (process.env.NODE_ENV === "development") {
    global.prismaClient = client
}

export { client }