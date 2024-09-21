// #region General Imports
import inputHandler from "$lib/server/inputHandler.js"
// #endregion



// #region load()
/*
    Define load subroutine to:
    Check if the client is logged in. If they are:
        - Create an object to keep track of the friend status 
          between the client's `User` entry and other entries.
        
        - Iterate over the friend requests the client has sent
          and received, setting the status flags for each unique
          user based on the `FriendRequest` entry being checked.
        
        - Count how many friend requests sent / received are 
          pending and how many mutual friend requests (friends)
          the client has.
        
        - Return relevant data client-side.
       
*/
/** @type {import("./$types").PageServerLoad} */
export const load = async ({ locals }) => {
    // Get `user` form locals
    const { user } = locals

    // If client is not logged in
    if (!user) {
        return
    }

    // IMPROVE: stop users with unverified email making requests


    /*
        Define object to hold usernames and their friend 
        status to the client.
    */
    const userFrRqStatuses = {}

    // Set all of the `User`s that the client has friended
    for (const frRq of [...user.frRqSent, ...user.frRqReceived]) {
        const desanitizedUsername = inputHandler.desanitize(
            /*
                If the recipient of the friend request is not the client,
                use that username for the key.
                Otherwise, it means the friend request was sent to the client,
                so the username should be of the sender.
            */
            frRq.recipientUsername !== user.username ? 
            frRq.recipientUsername : frRq.senderUsername
        )

        // Initialise the `User`'s status if the key does not exist yet
        if (!userFrRqStatuses[desanitizedUsername]) {
            userFrRqStatuses[desanitizedUsername] = {
                sent: false,
                received: false
            }
        }

        // If the friend request was sent to the client
        if (frRq.senderUsername === user.username) {
            userFrRqStatuses[desanitizedUsername].sent = true
        }

        // otherwise it must have been sent by the client
        else {
            userFrRqStatuses[desanitizedUsername].received = true
        }
    }


    /*
        Variables to store number of pending friend requests
        and mutual friend requests (friends).
    */
    let pendingSent = 0
    let pendingReceived = 0
    let friendCount = 0

    // Use the status of friend requests to increment variables
    for (const status of Object.values(userFrRqStatuses)) {
        switch (`${status.sent}-${status.received}`) {
            // If a request has been sent but has not been received
            case "true-false":
                pendingSent++
                break

            // If a request has not been sent but has been received
            case "false-true":
                pendingReceived++
                break

            // If both users have sent friend requests to each other
            case "true-true":
                friendCount++
                break
        }
    }


    // Return friend request data
    return { 
        friendRequests: {
            users: userFrRqStatuses,
            pendingSent,
            pendingReceived,
            friendCount
        } 
    }
}
// #endregion





// #region actions
    // #region Specific Imports
import dbClient from "$lib/server/prisma.js"
import logError from "$lib/server/errorLogger.js"
    // #endregion



    // #region Extras
/**
 * Get an `Object` containing a key for each input 
   in a form submission and their respective values.
 * @async
 *
 * 
 * @param {
        import("@sveltejs/kit").RequestEvent["request"]
    } request - The `.request` property of a `RequestEvent`.
 *
 * 
 * @returns {Promise<{
        "": any[]
    }>}
 */
const getFormData = async (request) => {
    return Object.fromEntries(await request.formData())
}


// TODO: Move to db operations file
/**
 * Get `User.id` of the entry with `User.username` equal to `username`.
 * @async
 * 
 * @param {String} username 
 * 
 * @returns {Promise<
 *      null |
 *      { id: String }
 * >}
 */
const getUser_id__by_username = async (username) => {
    if (typeof username !== "string") return null

    try {
        return await dbClient.user.findUnique({
            // Set field filters
            where: {
                username: username
            },
            // Set fields to return
            select: {
                id: true,
            }
        })

    // Catch errors
    } catch (error) {
        // Log error details
        logError({
            filepath: "src/routes/(main)/(private)/(user)/friends/+page.server.js",
            message: "Error while fetching `User` entry from db using username",
            arguments: {
                username: username
            }
        })

        return null
    }
}
    // #endregion



/*
    https://kit.svelte.dev/docs/form-actions#named-actions
    Define form actions
*/ 
/** @type {import("./$types").Actions} */
export const actions = {
    // #region sendFriendRequest()
    /**
     * Action to create friend request from client to another `User` entry.
     * `locals.user.username`
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
        }}
     */
    sendFriendRequest: async ({ request, locals }) => {
        // Get `user` from locals
        const { user } = locals

        // If client is not logged in
        if (!user) {
            return { status: 401 }
        }

        // IMPROVE: stop users with unverified email making requests


        // Get form data sent by client
        const formData = await getFormData(request)

        /*
            Do not validate username as existing usernames may not 
            conform to current validation checks, however these users
            should still be able to receive friend requests.
        */


        // Get `User` entry to send friend request
        const recipient = await getUser_id__by_username(inputHandler.sanitize(formData.username))

        // If a recipient with the provided username does not exist
        if (!recipient) {
            return { 
                status: 404,
                notice: "User with that username does not exist..."
            }
        }


        // TODO: Move to db operations file
        /*
            Create `FriendRequest` entry connected to two `User`s.
            The sending being the client and the recipient being the
            `User` entry which has the id: `recipient.id`.
        */
        try {
            await dbClient.user.update({
                // Set field filters
                where: {
                    id: user.id
                },
                // Set field data
                data: {
                    frRqSent : {
                        create: {
                            recipient: {
                                connect: {
                                    id: recipient.id
                                }
                            }
                        }
                    }
                }
            })
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(private)/(user)/friends/+page.server.js",
                message: "Error while creating `FriendRequest` entry in db",
                arguments: {
                    senderId: user.id,
                    recipientId: recipient.id
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't send a friend request, try again later..."
            }
        }


        return {
            status: 200,
            notice: "Successfully friended user!"
        }
    },
    // #endregion


    // #region cancelFriendRequest()
    /**
     * Action to delete existing friend request from client to another `User` entry.
     * `locals.user.username`
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
        }}
     */
    cancelFriendRequest: async ({ request, locals }) => {
        // Get `user` from locals
        const { user } = locals

        // If client is not logged in
        if (!user) {
            return { status: 401 }
        }

        // IMPROVE: stop users with unverified email making requests


        // Get form data sent by client
        const formData = await getFormData(request)

        /*
            Do not validate username as existing usernames may not 
            conform to current validation checks, however these users
            should still be able to have friend requests cancelled.
        */


        // Get `User` entry to cancel friend request
        const recipient = await getUser_id__by_username(inputHandler.sanitize(formData.username))

        // If a recipient with the provided username does not exist
        if (!recipient) {
            return { 
                status: 404,
                notice: "User with that username does not exist..."
            }
        }

        // TODO: Move to db operations file
        /*
            Delete `FriendRequest` entry connected to two `User`s.
            The sending being the client and the recipient being the
            `User` entry which has the id: `recipient.id`.
        */
        try {
            await dbClient.friendRequest.delete({
                // Set field filters
                where: {
                    users: {
                        senderId: user.id,
                        recipientId: recipient.id
                    }
                }
            })

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(private)/(user)/friends/+page.server.js",
                message: "Error while deleting `FriendRequest` entry in db",
                arguments: {
                    senderId: user.id,
                    recipientId: recipient.id
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't cancel a friend request, try again later..."
            }
        }

        return {
            status: 200,
            notice: "Successfully unfriended user!"
        }
    }
    // #endregion


    // #region declineFriendRequest()
        // TODO: Make a decline friend request action
    // #endregion 
}