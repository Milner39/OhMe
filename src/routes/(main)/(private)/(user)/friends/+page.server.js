// MARK: Load
// https://kit.svelte.dev/docs/load#page-data
// Define load function
export const load = async ({ locals }) => {
    // Get `user` object form locals
    const { user } = locals

    // If `user` is undefined
    if (!user) {
        // End load
        return
    }

    // IMPROVE: stop users with unverified email making requests


    // Define object to hold usernames and friend status
    const friends = {}

    // Set all of the `User`s that the client has friended
    for (const { recipientUsername } of user.friended) {
        // Set default values if key is undefined
        friends[recipientUsername] ??= {
            sent: false,
            received: false
        }
        friends[recipientUsername].sent = true
    }
    // Set all of the `User`s that have friended the client
    for (const { senderUsername } of user.friendOf) {
        // Set default values if key is undefined
        friends[senderUsername] ??= {
            sent: false,
            received: false
        }
        friends[senderUsername].received = true 
    }


    // Variables to store number of pending friend requests
    let pendingSent = 0
    let pendingReceived = 0

    // Use the status of friend requests to increment pending variables
    for (const status of Object.values(friends)) {
        switch (`${status.sent}-${status.received}`) {
            // If a request has been sent but has not been received
            case "true-false":
                pendingSent++
                break
            // If a request has not been sent but has been received
            case "false-true":
                pendingReceived++
                break
        }
    }


    // Return friend request data
    return { 
        friendRequests: {
            users: friends,
            pendingSent,
            pendingReceived
        } 
    }
}





// Import prisma client instance to interact with db
import { client as prismaClient } from "$lib/server/prisma"

// Import error logger to record error details
import { logError } from "$lib/server/errorLogger"


// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    // MARK: Send
    sendFriendRequest: async ({ request, locals }) => {
        // Get `user` object from locals
        const { user } = locals

        // If `user` is `undefined`
        if (!user) {
            // End action
            return {
                status: 401,
            }
        }

        // IMPROVE: stop users with unverified email making requests


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // TODO: sanitize username


        // Fetch id of `User` entry to send friend request
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set field filters
                where: {
                    username: formData.username
                },
                // Set fields to return
                select: {
                    id: true,
                }
            })

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var recipient = dbResponse
            } else {
                throw new Error()
            }

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(private)/(user)/friends/+page.server.js",
                message: "Error while fetching User entry from db using form-submitted username",
                arguments: {
                    username: formData.username
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't send a friend request, try again later..."
            }
        }


        // Create `FriendRequest` entry connected to two `User`s in db
        try {
            await prismaClient.User.update({
                // Set field filters
                where: {
                    id: user.id
                },
                // Set field data
                data: {
                    friended : {
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
                message: "Error while creating FriendRequest entry in db",
                arguments: {
                    senderId: user.id,
                    recipientId: recipient.id
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't send a friend request, try again later..."
            }
        }


        // End action
        return {
            status: 200,
            notice: "Successfully friended user!"
        }
    },


    // MARK: Cancel
    cancelFriendRequest: async ({ request, locals }) => {
        // Get `user` object from locals
        const { user } = locals

        // If `user` is `undefined`
        if (!user) {
            // End action
            return {
                status: 401,
            }
        }

        // IMPROVE: stop users with unverified email making requests


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // TODO: sanitize username


        // Fetch id of `User` entry to cancel friend request
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set field filters
                where: {
                    username: formData.username
                },
                // Set fields to return
                select: {
                    id: true,
                }
            })

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var recipient = dbResponse
            } else {
                throw new Error()
            }

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(private)/(user)/friends/+page.server.js",
                message: "Error while fetching User entry from db using form-submitted username",
                arguments: {
                    username: formData.username
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't cancel a friend request, try again later..."
            }
        }

        // Delete `FriendRequest` entry in db
        try {
            await prismaClient.Friends.delete({
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
                message: "Error while deleting FriendRequest entry in db",
                arguments: {
                    senderId: user.id,
                    recipientId: recipient.id
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't cancel a friend request, try again later..."
            }
        }

        // End action
        return {
            status: 200,
            notice: "Successfully unfriended user!"
        }
    }


    // MARK: Decline
    // TODO: Make a decline friend request action
}