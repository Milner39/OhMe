// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import logError from "$lib/server/utils/errorLogger.js"

import { Prisma } from "@prisma/client" // For type definitions
// #endregion Imports



// #region Actions
// Define record to include specific relations in the `User` table
/** @type {Prisma.UserInclude} */
const userInclude = {
    email: true,
    password: true,
    sessions: true,
    frRqSent: true,
    frRqReceived: true
}



// #region findUnique()
/**
 * Fetch a single `User` entry.
 * @async
 * 
 * @param {Prisma.UserWhereInput} filter - 
   The filter used to check `User` entries.
 */
const findUnique = async (filter) => {
    try {
        /*
            Find `User` entries matching the filter 
            but stop at 2 results.
        */
        const users = await dbClient.user.findMany({
            include: userInclude,
            take: 2, // Stop at 2 results
            where: filter
        })


        // No results found
        if (users.length === 0) return {
            user: null,
            success: false,
            error: "No entry found"
        }

        // Multiple results found
        if (users.length > 1) return {
            user: null,
            success: false,
            error: "Multiple entries found"
        }


        // Return the single result
        return {
            user: users[0],
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while fetching `User` entry",
            arguments: {
                where: filter
            },
            error
        })

        return {
            user: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion findUnique()


// #region findMany()
/**
 * Fetch multiple `User` entries.
 * @async
 * 
 * @param {Prisma.UserFindManyArgs} options - 
   The options used in the query.
 */
const findMany = async (options) => {
    try {
        // Find `User` entries
        const users = await dbClient.user.findMany({
            include: userInclude,
            ...options
        })


        // No results found
        if (users.length === 0) return {
            users: [], // `[]` because the query was successful
            success: true,
            error: "No entries found"
        }


        // Return the results
        return {
            users: users,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while fetching `User` entries",
            arguments: {
                options: options
            },
            error
        })

        return {
            user: null, // `null` because the query failed
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion findMany()

// #endregion Actions



// #region Exports

// Define object to hold all `User` actions
const userActions = {
    findUnique,
    findMany
}

// Default export for the entire object
export default userActions

// Named export for each action
export { findUnique, findMany }

// #endregion Exports