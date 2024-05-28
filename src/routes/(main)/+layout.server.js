// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({ locals }) => {
    // Get `notice`
    const notice = locals.notice || null

    // Reset notice
    locals.notice = null

    // Return `notice`
    return { notice }
}