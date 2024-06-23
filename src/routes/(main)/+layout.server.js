// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({ url }) => {
    // Define notice messages
    const notices = {
        login: "You must be logged in to access that page.",
        admin: "Admin privileges are required to access that page."
    }
    // Set `notice` based on URL parameter
    const notice = notices[url.searchParams.get("protected")] || null

    // Return the `notice` 
    return { notice }
}