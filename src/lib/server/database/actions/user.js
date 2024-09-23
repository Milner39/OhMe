// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import logError from "$lib/server/utils/errorLogger"

import { Prisma } from "@prisma/client" // For type definitions
// #endregion



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
 * Fetch a single `User` entry from the database.
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
            success: true
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while fetching `User` entry from db",
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
// #endregion



// #region findMany()
/**
 * Fetch multiple `User` entries from the database.
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
            success: true
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while fetching `User` entries from db",
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
// #endregion

// #endregion