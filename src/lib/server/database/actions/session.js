// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import logError from "$lib/server/utils/errorLogger"

import { Prisma } from "@prisma/client" // For type definitions
// #endregion



// #region Actions
// Define record to include specific relations in the `Session` table
/** @type {Prisma.SessionInclude} */
const sessionInclude = {
    user: {
        email: true,
        password: true,
        sessions: true,
        frRqSent: true,
        frRqReceived: true
    }
}



// #region findUnique()
/**
 * Fetch a single `Session` entry from the database.
 * @async
 * 
 * @param {Prisma.SessionWhereInput} filter - 
   The filter used to check `Session` entries.
 */
const findUnique = async (filter) => {
    try {
        /*
            Find `Session` entries matching the filter 
            but stop at 2 results.
        */
        const sessions = await dbClient.session.findMany({
            include: sessionInclude,
            take: 2, // Stop at 2 results
            where: filter
        })


        // No results found
        if (sessions.length === 0) return {
            session: null,
            success: false,
            error: "No entry found"
        }

        // Multiple results found
        if (sessions.length > 1) return {
            session: null,
            success: false,
            error: "Multiple entries found"
        }


        // Return the single result
        return {
            session: sessions[0],
            success: true
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/session.js",
            message: "Error while fetching `Session` entry from db",
            arguments: {
                where: filter
            },
            error
        })

        return {
            session: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion



// #region findMany()
/**
 * Fetch multiple `Session` entries from the database.
 * @async
 * 
 * @param {Prisma.SessionFindManyArgs} options - 
   The options used in the query.
 */
const findMany = async (options) => {
    try {
        // Find `Session` entries
        const sessions = await dbClient.session.findMany({
            include: sessionInclude,
            ...options
        })


        // No results found
        if (sessions.length === 0) return {
            sessions: [], // `[]` because the query was successful
            success: true,
            error: "No entries found"
        }


        // Return the results
        return {
            sessions: sessions,
            success: true
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/session.js",
            message: "Error while fetching `Session` entries from db",
            arguments: {
                options: options
            },
            error
        })

        return {
            session: null, // `null` because the query failed
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion

// #endregion



// #region Exports

// Define object to hold all `Session` actions
const sessionActions = {
    findUnique,
    findMany
}

// Default export for the entire object
export default sessionActions

// Named export for each action
export { findUnique, findMany }

// #endregion