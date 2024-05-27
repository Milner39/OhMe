// https://kit.svelte.dev/docs/load#redirects
// "To redirect users, use the redirect helper from @sveltejs/kit to specify the location
//  to which they should be redirected..."
import { redirect } from '@sveltejs/kit'

// Define redirect url
const loginUrl = "/login"

// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({locals}) => {
    // If `locals.session` is undefined (Client not logged in)
    if (!locals.session) {
        // Redirect to login page
        redirect(302, loginUrl)
    }
}

// TODO: change notice to prompt user to login on redirect