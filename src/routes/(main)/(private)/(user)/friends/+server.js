// #region Imports
import dbActions from "$lib/server/database/actions/all.js"
import inputHandler from "$lib/server/utils/inputHandler.js"

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

    /*
        Get `User` entries which usernames contain `search`.
        Look for exact matches first, then partial matches.
        Do not include the client's username in the results.
    */

    // Exact match
    const exactMatchResponse = await dbActions.user.findUnique({
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
    })

    const exactMatch = exactMatchResponse.user
    // Exact match


    // Partial matches
    const partialMatchResponse = await dbActions.user.findMany({
        /* 
            Set quantity of results
            - If an exact match was found, 9, else 10
        */
        take: exactMatch ? 9 : 10,
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
        }
    })

    const partialMatches = partialMatchResponse.users
    // Partial matches


    // Combine results and filter out `null` values
    const users = [exactMatch, ...partialMatches].filter((match) => { 
        if (match === null) { return undefined }

        return match
    })
        

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
            }[]
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