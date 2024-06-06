// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// https://kit.svelte.dev/docs/modules#sveltejs-kit-json
// "Create a JSON Response object from the supplied data."
import { json } from "@sveltejs/kit"

// https://kit.svelte.dev/docs/form-actions#alternatives
// "...you can also use +server.js files to expose (for example) a JSON API."
// Define POST function
export const POST = async ({ request, locals }) => {
    // Get `user` object from locals
    const { user } = locals

    // IMPROVE: stop users with unverified email making requests
    
    // If `user` is undefined
    if (!user) {
        // Return appropriate response object
        json({ status: 401 })
    }

    // Get request data sent by client
    const { search } = await request.json()

    // TODO: sanitize search

    // Get User entries that start with the search from the request
    try {
        // Get User entry with exactly matching username
        let exactMatch = await prismaClient.User.findFirst({
            // Set filter fields
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
            // Set return fields
            select: {
                username: true,
                friended: true,
                friendOf: true
            }
        })

        // Get User entry with partialy matching username
        let partialMatch = await prismaClient.User.findMany({
            // Set quantity of results
            // If an exact match is found, get 9, else 10
            take: exactMatch ? 9 : 10,
            // Set filter fields
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
            // Set return fields
            select: {
                username: true,
                friended: true,
                friendOf: true
            }
        })

        // Combine results and filter out undefined
        var users = [exactMatch, ...partialMatch].filter((match) => { return match })

        // Structure the results with booleans to indicate which users are friends
        users = users.reduce((prev, match) => {
            const sent = match.friendOf.some(entry => entry.senderId === user.id)
            const received = match.friended.some(entry => entry.recipientId === user.id)
            return ({...prev, [match.username]: {
                sent,
                received
        }})}, {})

    } catch (err) {
        // Catch errors
        switch (err.code) {
            // Match error code to appropriate error message
            default:
                console.error("Error at friends/server.js")
                console.error(err)
                break
        }
        // Return appropriate response object if users cannot be fetched
        return json({ status: 503 })
    }
    
    // Return appropriate response object if users fetched
    return json({ users }, { status: 200 })
}