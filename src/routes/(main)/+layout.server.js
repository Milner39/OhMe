// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({ locals }) => {
    // If `locals.user` is defined (Client logged in)
    if (locals.user) {
        // Return only the `user` object
        const {sessions, ...user} = locals.user
        return { user }
    }
}