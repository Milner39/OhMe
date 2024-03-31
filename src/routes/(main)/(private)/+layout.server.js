// Import function to redirect user
import { redirect } from '@sveltejs/kit'

// Define "loginPage" so user isn't redirected from the login page back to the login page
// Prevents infinite loop which causes error
const loginPage = "/login"

// Define load function to be ran on every page down this route
export const load = async (event) => {
    // Don't redirect if already at redirect target
    if (event.url.pathname === loginPage) { return }

    // If user has no session, redirect to login page
    if (!event.locals.session) {
        redirect(302, loginPage)
    }
}