// Define load function
export const load = async ({ locals }) => {
    return {
        user: locals.user,
        session: locals.session
    }
}