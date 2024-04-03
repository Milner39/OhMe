// Define load function
export const load = async ({ locals }) => {
    if (!locals.user) { return null }

    const {sessions, ...user} = locals.user
    return { user }
}