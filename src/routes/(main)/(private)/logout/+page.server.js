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
                errors: {server: "Client not logged in"}
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
            return {
                status: 503,
                errors: {sever: "Could not logout client"}
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors
        }
    }
}