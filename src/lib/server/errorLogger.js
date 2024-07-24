// Import prisma client instance to interact with db
import { client as prismaClient } from "./prisma"

// Import format date utility
import { formatDate } from "../utils/formatDate"

// Import chalk to color console messages
import chalk from "chalk"


// Function to create entries in db
// to store error information
const logError = async (details) => {
    // Get timestamp when error occurred
    const timestamp = formatDate(new Date())

    try {
        // Create entry in db
        await prismaClient.Error.create({
            // Set field data
            data: {
                json: JSON.stringify({
                    timestamp,
                    ...details
                    // Details should include:
                    //     filepath
                    //     message
                    //     arguments
                    //     error
                })
            }
        })
        console.log(chalk.green(`${timestamp} => Error logged`))
    
    // Catch errors
    } catch {
        // Log messages to the console if they fail to log to db
        console.log(chalk.red(`${timestamp} => Failed to log error:`))
        console.log(chalk.red(JSON.stringify(details, 0, 2)))
    }
}


// Export
export { logError }