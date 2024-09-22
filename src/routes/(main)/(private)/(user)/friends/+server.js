// #region Imports
import dbClient from "$lib/server/database/prisma/prisma.js"
import inputHandler from "$lib/server/inputHandler.js"
import logError from "$lib/server/errorLogger.js"

/*
    https://kit.svelte.dev/docs/modules#sveltejs-kit-json
    Subroutine to create a `Response` object 
*/
import { json } from "@sveltejs/kit"
// #endregion



// #region POST()
/*
    https://kit.svelte.dev/docs/routing#server
    Define POST request handler
*/
/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }) => {
    // Get `user` form locals
    const { user } = locals
    
    // If client is not logged in
    if (!user) {
        return json({ status: 401 })
    }

    // IMPROVE: stop users with unverified email making requests
    

    // Get username `search` from client's request
    const { search } = await request.json()

    /*
        Do not validate search as existing usernames may not 
        conform to current validation checks, however these users 
        should still be able to be searched for.
    */

    
    // Sanitize search
    const sanitizedSearch = inputHandler.sanitize(search)

    // TODO: Move to db operations file
    /*
        Get `User` entries which usernames contain `search`.
        Look for exact matches first, then partial matches.
    */
    try {
        // Get `User` entry with exactly matching username
        let exactMatch = await dbClient.user.findFirst({
            // Set field filters
            where: {
                AND: [
                    {
                        username: sanitizedSearch
                    },
                    {
                        username: {
                            not: user.username
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

        // Get `User` entries with partially matching username
        let partialMatch = await dbClient.user.findMany({
            /* 
                Set quantity of results
                - If an exact match was found, 9, else 10
            */
            take: exactMatch ? 9 : 10,
            // Set field filters
            where: {
                AND: [
                    {
                        username: {
                            startsWith: sanitizedSearch
                        }
                    },
                    {
                        username: {
                            not: sanitizedSearch
                        }
                    },
                    {
                        username: {
                            not: user.username
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

        // Combine results and filter out `null`
        var users = [exactMatch, ...partialMatch].filter((match) => { return match })

    // Catch errors
    } catch (error) {
        // Log error details
        logError({
            filepath: "src/routes/(main)/(private)/(user)/friends/+server.js",
            message: "Error while fetching `User` entries from db using username search",
            arguments: {
                search: search
            },
            error
        })

        return json({ status: 503 })
    }


    /*
        Structure the results into an object which keys are the 
        usernames and the values are nested objects with booleans 
        to indicate friend requests statuses.
    */
    /** 
     * @type {{
            "": {
                sent: Boolean,
                received: Boolean 
            }}
        } 
     */
    const userFrRqStatuses = users.reduce((obj, match) => {
        const sent = match.frRqReceived.some(entry => entry.senderId === user.id)
        const received = match.frRqSent.some(entry => entry.recipientId === user.id)

        return ({...obj, [inputHandler.desanitize(match.username)]: {
            sent,
            received
        }
    })}, {})
    

    // Return fetched user data
    return json({ users: userFrRqStatuses }, { status: 200 })
}
// #endregion