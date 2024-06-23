// Import prisma client instance to interact with db
import { client as prismaClient } from "$lib/server/prisma"

// Import error logger to record error details
import { logError } from "$lib/server/errorLogger"

// https://kit.svelte.dev/docs/modules#sveltejs-kit-json
// "Create a JSON Response object from the supplied data."
import { json } from "@sveltejs/kit"


// https://kit.svelte.dev/docs/form-actions#alternatives
// "...you can also use +server.js files to expose (for example) a JSON API."
// Define POST function
export const POST = async ({ request, locals }) => {
    // Get `user` object from locals
    const { user } = locals
    
    // If `user` is `undefined`
    if (!user) {
        // End interface
        return json({ status: 401 })
    }

    // IMPROVE: stop users with unverified email making requests
    

    // Get request data sent by client
    const { search } = await request.json()

    // TODO: sanitize search


    // Get `User` entries which usernames contain `search`
    // Not including the client's username
    try {
        // Get `User` entry with exactly matching username
        let exactMatch = await prismaClient.User.findFirst({
            // Set field filters
            where: {
                AND: [
                    {
                        username: search
                    },
                    {
                        username: {
                            not: locals.user.username
                        }
                    }
                ]
            },
            // Set fields to return
            select: {
                username: true,
                frRqSent: true,
                frRqReceived: true
            }
        })

        // Get `User` entry with partially matching username
        let partialMatch = await prismaClient.User.findMany({
            // Set quantity of results
            // If an exact match is found, get 9, else 10
            take: exactMatch ? 9 : 10,
            // Set field filters
            where: {
                AND: [
                    {
                        username: {
                            startsWith: search, 
                        }
                    },
                    {
                        username: {
                            not: search
                        }
                    },
                    {
                        username: {
                            not: locals.user.username
                        }
                    }
                ]
            },
            // Set fields to return
            select: {
                username: true,
                frRqSent: true,
                frRqReceived: true
            }
        })

        // Combine results and filter out `undefined`
        var users = [exactMatch, ...partialMatch].filter((match) => { return match })

        // Structure the results with booleans to indicate which users are friends
        users = users.reduce((prev, match) => {
            const sent = match.frRqReceived.some(entry => entry.senderId === user.id)
            const received = match.frRqSent.some(entry => entry.recipientId === user.id)
            return ({...prev, [match.username]: {
                sent,
                received
        }})}, {})

    // Catch errors
    } catch (error) {
        // Log error details
        logError({
            filepath: "src/routes/(main)/(private)/(user)/friends/+server.js",
            message: "Error while fetching User entries from db using username search",
            arguments: {
                search: search
            },
            error
        })

        // End interface
        return json({ status: 503 })
    }
    

    // Return fetched user data
    // End interface
    return json({ users }, { status: 200 })
}