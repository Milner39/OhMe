// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    default: async ({ locals }) => {
        // Get `session` object from locals
        const { session } = locals

        // If `session` is undefined
        if (!session) {
            // Return appropriate response object
            return {
                status: 401,
                errors: {server: "Client not logged in"},
                notice
            }
        }

        // Delete Session entry from db
        try {
            await prismaClient.Session.delete({
                // Set filter feilds
                where: {
                    id: session.id
                }
            })
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at logout/+page.server.js")
                    console.error(err)
                    break
            }
            // Return appropriate response object if Session entry cannot be deleted
            return {
                status: 503,
                errors: {sever: "Could not logout client"},
                notice: "We couldn't log you out, try again later..."
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors: {},
            notice: "Successfully logged out!"
        }
    }
}