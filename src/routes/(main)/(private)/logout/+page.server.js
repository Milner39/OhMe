// Import prisma client
import { client as prismaClient } from "$lib/server/prisma"

export const actions = {
    default: async ({ locals }) => {
        // Get session from locals
        const { session } = locals

        // If no session
        if (!session) {
            return
        }

        // Delete session from database
        try {
            await prismaClient.Session.delete({
                where: {
                    id: session.id
                }
            })
        } catch (err) {
            console.log(err)
        }
    }
}