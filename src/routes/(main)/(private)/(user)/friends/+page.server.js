// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// https://kit.svelte.dev/docs/load#page-data
// Define load function
export const load = async ({ locals }) => {
    // MARK: Load
    // Get `user` object form locals
    const { user } = locals

    // If `user` is undefined
    if (!user) {
        return
    }

    // Initialize object to hold usernames and friend status
    const friends = {}

    // Set all of the User entries that the client has friended
    for (const { recipientUsername } of user.friended) {
        // Set default values if `friends[recipientUsername]` is undefined
        friends[recipientUsername] ??= {
            sent: false,
            received: false
        }
        friends[recipientUsername].sent = true
    }
    // Set all of the User entries that have friended the client
    for (const { senderUsername } of user.friendOf) {
        // Set default values if `friends[senderUsername]` is undefined
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

    // Return `friendRequests` object
    return { 
        friendRequests: {
            users: friends,
            pendingSent,
            pendingReceived
        } 
    }
}

// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    // MARK: Friend
    friend: async ({ request, locals }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice
        
        // IMPROVE: stop users with unverified email making requests
        
        // Get `user` object from locals
        const { user } = locals

        // If `user` is undefined
        if (!user) {
            // Return appropriate response object
            return {
                status: 401,
                errors: {server: "Client not logged in"},
                notice
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // TODO: sanitize username

        // Get User entry to friend
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set filter fields
                where: {
                    username: formData.username
                },
                // Set return fields
                select: {
                    id: true,
                }
            })
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get data from object
                var friend = dbResponse
            } else {
                throw new Exception()
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at friends/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to get user"
                    break
            }
            // Return appropriate response object if User entry cannot be fetched
            return {
                status: 503,
                errors,
                notice: "We couldn't add your friend, try again later..."
            }
        }

        // Update User entry in db
        try {
            await prismaClient.User.update({
                // Set filter fields
                where: {
                    id: user.id
                },
                // Set update fields
                data: {
                    friended : {
                        create: {
                            recipient: {
                                connect: {
                                    id: friend.id
                                }
                            }
                        }
                    }
                }
            })
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at friends/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to friend user"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
                notice: "We couldn't add your friend, try again later..."
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully friended user!"
        }
    },
    // MARK: Unfriend
    unfriend: async ({ request, locals }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice
        
        // Get `user` object from locals
        const { user } = locals

        // If `user` is undefined
        if (!user) {
            // Return appropriate response object
            return {
                status: 401,
                errors: {server: "Client not logged in"},
                notice
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // TODO: sanitize username

        // Get User entry to unfriend
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set filter fields
                where: {
                    username: formData.username
                },
                // Set return fields
                select: {
                    id: true,
                }
            })
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get data from object
                var friend = dbResponse
            } else {
                throw new Exception()
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at friends/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to get user"
                    break
            }
            // Return appropriate response object if User entry cannot be fetched
            return {
                status: 503,
                errors,
                notice: "We couldn't unfriend that user, try again later..."
            }
        }

        // Delete Friends entry in db
        try {
            await prismaClient.Friends.delete({
                // Set filter fields
                where: {
                    users: {
                        senderId: user.id,
                        recipientId: friend.id
                    }
                },
            })
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at friends/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to unfriend user"
                    break
            }
            // Return appropriate response object if User entry cannot be fetched
            return {
                status: 503,
                errors,
                notice: "We couldn't unfriend that user, try again later..."
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully unfriended user!"
        }
    }
}