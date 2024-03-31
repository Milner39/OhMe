// Import the lucia client to manage sessions
import { client as luciaClient } from "$lib/server/lucia"

// Import function to redirect user
import { redirect } from '@sveltejs/kit'

export const actions = {
    default: async ({ locals }) => {
        // Get session from locals
        const { session } = locals

        // If user has no session, redirect to "/"
        if (!session) {
            redirect(302, "/")
        }

        // Delete session from database
        await luciaClient.invalidateSession(session.id)

        // Redirect to "/"
        redirect(302, "/")
    }
}