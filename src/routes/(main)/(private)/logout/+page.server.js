// Import prisma client instance to interact with db
import { client as prismaClient } from "$lib/server/prisma"

// Import error logger to record error details
import { logError } from "$lib/server/errorLogger"


// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    default: async ({ locals }) => {
        // Get `session` object from locals
        const { session } = locals

        // If `session` is `undefined`
        if (!session) {
            // End action
            return {
                status: 401
            }
        }


        // Delete `Session` entry in db
        try {
            await prismaClient.Session.delete({
                // Set field filters
                where: {
                    id: session.id
                }
            })

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(private)/(user)/+page.server.js",
                message: "Error while deleting Session entry in db",
                arguments: {
                    sessionId: session.id
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't log you out, try again later..."
            }
        }


        // End action
        return {
            status: 200,
            notice: "Successfully logged out!"
        }
    }
}