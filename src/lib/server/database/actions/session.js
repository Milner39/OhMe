// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import { dateFromNow } from "$lib/client/utils/dateUtils.js"
import logError from "$lib/server/utils/errorLogger.js"
import { settings }  from "$lib/settings.js"

import { Prisma } from "@prisma/client" // For type definitions
// #endregion



// #region Actions
// Define record to include specific relations in the `Session` table
/** @type {Prisma.SessionInclude} */
const sessionInclude = {
    user: {
        include: {
            email: true,
            password: true,
            sessions: true,
            frRqSent: true,
            frRqReceived: true
        }
    }
}



// #region findUnique()
/**
 * Get a single `Session` entry.
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
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/session.js",
            message: "Error while getting `Session` entry",
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
// #endregion findUnique()



// #region findMany()
/**
 * Get multiple `Session` entries.
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
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/session.js",
            message: "Error while getting `Session` entries",
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
// #endregion findMany()


// #region refreshSessionExpiry()
/**
 * Update the expiry date of a `Session` entry.
 * @async
 * 
 * @param {string} sessionId - The id of the `Session` entry.
 */
const refreshSessionExpiry = async (sessionId) => {
    try {
        // Get date set number of days from now
        const expiryDate = dateFromNow(settings.session.duration * 24 * (60 ** 2) * 1000)

        // Update the `Session` entry
        await dbClient.session.update({
            where: {
                id: sessionId
            },
            data: {
                expiresAt: expiryDate
            }
        })

        // Return the new expiry date
        return {
            expiryDate: expiryDate,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/session.js",
            message: "Error while refreshing `Session` entry expiry date",
            arguments: {
                sessionId: sessionId
            },
            error
        })

        return {
            expiryDate: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion refreshSessionExpiry()

// #endregion Actions



// #region Exports

// Define object to hold all `Session` actions
const sessionActions = {
    findUnique,
    findMany,
    refreshSessionExpiry
}

// Default export for the entire object
export default sessionActions

// Named export for each action
export { findUnique, findMany, refreshSessionExpiry }

// #endregion Exports