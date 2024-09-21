/*
    Define load subroutine to pass the correct notice 
    message to the client based on why they were prevented 
    access to a route.
*/
/** @type {import("./$types").LayoutServerLoad} */
export const load = async ({ url }) => {
    // Define notice messages
    const notices = {
        login: "You must be logged in to access that page.",
        admin: "Admin privileges are required to access that page."
    }
    // Set `notice` based on search parameter
    const notice = notices[url.searchParams.get("protected")] || null

    // Return notice data
    return { notice }
}