// Import prisma client
import { client as prismaClient } from "$lib/server/prisma"

export const actions = {
    default: async ({ locals }) => {
        // Get session from locals
        const { session } = locals

        // If no session
        if (!session) {
            return {
                status: 403,
                errors: {server: "Client not logged in"},
                notice: "Login to access that page"
            }
        }

        // Delete session from database
        try {
            await prismaClient.Session.delete({
                where: {
                    id: session.id
                }
            })
        } catch (err) {
            console.error("Error at logout.server.js:")
            console.error(err)
            return {
                status: 503,
                errors: {sever: "Could not logout client"},
                notice: "We couldn't log you out, try again later..."
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors: {},
            notice: "Successfully loged out!"
        }
    }
}