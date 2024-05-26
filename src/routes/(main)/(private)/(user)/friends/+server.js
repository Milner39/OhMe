// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// https://kit.svelte.dev/docs/modules#sveltejs-kit-json
// "Create a JSON Response object from the supplied data."
import { json } from "@sveltejs/kit"

// https://kit.svelte.dev/docs/form-actions#alternatives
// "...you can also use +server.js files to expose (for example) a JSON API."
// Define POST function
export const POST = async ({ request, locals }) => {

    // IMPROVE: stop users with unverified email making requests

    // Get request data sent by client
    const { search } = await request.json()

    // TODO: sanitize search

    // Get User entries that start with the search from the request
    try {
        let dbResponse = await prismaClient.User.findMany({
            // Set quantity of results
            take: 10,
            // Set filter feilds
            where: {
                username: {
                    startsWith: search, 
                }
            },
            // Set return feilds
            select: {
                username: true
            }
        })
        // If `dbResponse` is not undefined
        if (dbResponse) {
            // Get users
            var users = dbResponse
        }
    } catch (err) {
        // Catch errors
        switch (err.code) {
            // Match error code to appropriate error message
            default:
                console.error("Error at friends.server.js")
                console.error(err)
                break
        }
        // Return appropriate response object if users cannot be fetched
        return json({ status: 503})
    }
    
    // Return appropriate response object if users fetched
    return json({ users }, { status: 200 })
}