// Import function to redirect user
import { redirect } from '@sveltejs/kit'

// Define page to redirect to
const loginPage = "/login"

// Define load function to be ran on every page down this route
export const load = async (event) => {
    // If client has no session, redirect to login page
    if (!event.locals.session) {
        redirect(302, loginPage)
    }
}