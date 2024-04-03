// Define load function
export const load = async ({ locals }) => {
    const {sessions, ...user} = locals.user
    return { user }
}