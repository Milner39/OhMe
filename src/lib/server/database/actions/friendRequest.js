// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import logError from "$lib/server/utils/errorLogger.js"

import { Prisma } from "@prisma/client" // For type definitions
// #endregion Imports



// #region Actions
// Define record to include specific relations in the `FriendRequest` table
/** @type {Prisma.FriendRequestInclude} */
const friendRequestInclude = {}



// #region findUnique()
/**
 * Get a single `FriendRequest` entry.
 * @async
 * 
 * @param {Prisma.FriendRequestWhereInput} filter - 
   The filter used to check `FriendRequest` entries.
 */
const findUnique = async (filter) => {
    try {
        /*
            Find `FriendRequest` entries matching the filter 
            but stop at 2 results.
        */
        const friendRequests = await dbClient.friendRequest.findMany({
            include: friendRequestInclude,
            take: 2, // Stop at 2 results
            where: filter
        })


        // No results found
        if (friendRequests.length === 0) return {
            friendRequest: null,
            success: false,
            error: "No entry found"
        }

        // Multiple results found
        if (friendRequests.length > 1) return {
            friendRequest: null,
            success: false,
            error: "Multiple entries found"
        }


        // Return the single result
        return {
            friendRequest: friendRequests[0],
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/friendRequest.js",
            message: "Error while getting `FriendRequest` entry",
            arguments: {
                where: filter
            },
            error
        })

        return {
            friendRequest: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion findUnique()


// #region findMany()
/**
 * Get multiple `FriendRequest` entries.
 * @async
 * 
 * @param {Prisma.FriendRequestFindManyArgs} options - 
   The options used in the query.
 */
const findMany = async (options) => {
    try {
        // Find `FriendRequest` entries
        const friendRequests = await dbClient.friendRequest.findMany({
            include: friendRequestInclude,
            ...options
        })


        // No results found
        if (friendRequests.length === 0) return {
            friendRequests: [], // `[]` because the query was successful
            success: true,
            error: "No entries found"
        }


        // Return the results
        return {
            friendRequests: friendRequests,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/friendRequest.js",
            message: "Error while getting `FriendRequest` entries",
            arguments: {
                options: options
            },
            error
        })

        return {
            friendRequest: null, // `null` because the query failed
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion findMany()


// #region create()
/**
 * Create a `FriendRequest` entry.
 * @async
 * 
 * 
 * @param {string} senderId - 
   The id of the `User` entry sending the request.
 *
 * @param {string} recipientId - 
   The id of the `User` entry receiving the request.
 */
const create = async (senderId, recipientId) => {
    try {
        // Prevent sender from sending a request to themselves
        if (senderId === recipientId) return {
            friendRequest: null,
            success: false,
            error: "Sender cannot be recipient"
        }


        const friendRequest = await dbClient.friendRequest.create({
            include: friendRequestInclude,
            data: {
                sender: { connect: { id: senderId } },
                recipient: { connect: { id: recipientId } }
            }
        })


        return {
            friendRequest: friendRequest,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/friendRequest.js",
            message: "Error while creating `FriendRequest` entry",
            arguments: {
                senderId: senderId,
                recipientId: recipientId
            },
            error
        })

        return {
            friendRequest: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion create()


// #region delete()
/**
 * Delete a `FriendRequest` entry.
 * @async
 * 
 * 
 * @param {string} senderId - 
   The id of the `User` entry deleting the request.
 *
 * @param {string} recipientId - 
   The id of the `User` entry the request was for.
 */
const delete_ = async (senderId, recipientId) => {
    try {
        /*
            Get the `FriendRequest` entry that matches 
            the sender and recipient ids.
        */
        const findUniqueResponse = await findUnique({
            users: {
                senderId: senderId,
                recipientId: recipientId
            }
        })

        // Check a `FriendRequest` entry was found
        if (!findUniqueResponse.success) {
            return {
                success: false,
                error: findUniqueResponse.error
            }
        }


        // Delete the `FriendRequest` entry
        await dbClient.friendRequest.delete({
            where: {
                users: {
                    senderId: senderId,
                    recipientId: recipientId
                }
            }
        })

        return {
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/friendRequest.js",
            message: "Error while deleting `FriendRequest` entry",
            arguments: {
                senderId: senderId,
                recipientId: recipientId
            },
            error
        })

        return {
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion delete()

// #endregion Actions



// #region Exports

// Define object to hold all `FriendRequest` actions
const friendRequestActions = {
    findUnique,
    findMany,
    create,
    delete: delete_
}

// Default export for the entire object
export default friendRequestActions

// Named export for each action
export { findUnique, findMany, create, delete_ }

// #endregion Exports