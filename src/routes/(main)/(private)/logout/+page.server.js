// Import prisma client
import { client as prismaClient } from "$lib/server/prisma"

// Import function to redirect user
import { redirect } from '@sveltejs/kit'

export const actions = {
    default: async ({ locals }) => {
        // Get session from locals
        const { session } = locals

        // If user has no session
        if (!session) {
            redirect(302, "/")
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

        redirect(302, "/")
    }
}