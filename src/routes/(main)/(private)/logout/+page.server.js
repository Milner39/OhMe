// #region Imports
import dbClient from "$lib/server/prisma.js"
import logError from "$lib/server/errorLogger.js"
// #endregion



// #region actions
/*
    https://kit.svelte.dev/docs/form-actions#default-actions
    Define form action
*/ 
/** @type {import("./$types").Actions} */
export const actions = {
    // #region default()
    /**
     * Action to delete the `Session` entry the client is using
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
        }}
     */
    default: async ({ locals }) => {
        // Get `session` from locals
        const { session } = locals

        // If client is not logged in
        if (!session) {
            return { status: 401 }
        }


        // TODO: Move to db operations file
        // Delete `Session` entry
        try {
            await dbClient.session.delete({
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
                message: "Error while deleting `Session` entry in db",
                arguments: {
                    sessionId: session.id
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't log you out, try again later..."
            }
        }


        return {
            status: 200,
            notice: "Successfully logged out!"
        }
    }
}