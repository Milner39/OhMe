// #region Imports
import dbSessionActions from "$lib/server/database/actions/session.js"
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


        // Delete `Session` entry
        const session_dResponse = await dbSessionActions.delete({
            id: session.id
        })

        // Check if session deletion was successful
        if (!session_dResponse.success) {
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