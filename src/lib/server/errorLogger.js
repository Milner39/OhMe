// Import prisma client instance to interact with db
import { client as prismaClient } from "./prisma"

// Import chalk to color console messages
import chalk from "chalk"


// Function to create entries in db
// to store error information
const logError = async (details) => {
    try {
        // Create entry in db
        await prismaClient.Error.create({
            // Set field data
            data: {
                json: JSON.stringify({
                    timestamp: new Date(),
                    ...details
                    // Details should include:
                    //     filepath
                    //     message
                    //     arguments
                    //     error
                })
            }
        })
    
    // Catch errors
    } catch (error) {
        // Log messages to the console if they fail to log to db
        console.log(chalk.red("Failed to log error:"))
        console.log(chalk.red(error))
    }
}


// Export
export { logError }