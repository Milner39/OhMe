// #region Imports
import dbClient from "$lib/server/database/prisma/prisma.js"
import dataUtils from "$lib/client/utils/dateUtils.js"
import chalk from "chalk"
// #endregion



// #region logError()
/**
 * Log error in the database.
 * @async
 * 
 * @param {{
        filepath: String,
        message: String,
        arguments: {"": any[]},
        error: any
    }} details - Specific error information.
 */
const logError = async (details) => {
    // Get timestamp when error occurred
    const timestamp = dataUtils.format(new Date())

    try {
        // Create entry in db
        await dbClient.error.create({
            // Set field data
            data: {
                json: JSON.stringify({
                    timestamp,
                    ...details
                }, null, 4)
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
// #endregion



// #region Exports

// Default export
export default logError

// #endregion