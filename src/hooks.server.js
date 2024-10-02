// #region General Imports

/*
    https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks
    Subroutine to run hooks sequentially
*/
import { sequence } from "@sveltejs/kit/hooks"

import { settings }  from "$lib/settings.js"
// #endregion General Imports



// #region Handles

// #region auth()
        
// #region Specific Imports
import dbActions from "$lib/server/database/actions/all.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
import { dateFromNow } from "$lib/client/utils/dateUtils.js"
// #endregion Specific Imports



// #region Extras
/** 
 * Delete the cookies used for authentication from 
   the client's browser.
 * @async 
 * 
 * @param {import("@sveltejs/kit").Cookies} cookies - 
   The SvelteKit `Cookies` object provided by a handle.
 */
const deleteAuthCookies = async (cookies) => {
    // Delete client's cookies
    cookies.delete("user", {
        path: "/",
        secure: false
    })
    cookies.delete("session", {
        path: "/",
        secure: false
    })
}
// #endregion Extras


// Define handle to manage client authentication
/** @type {import("@sveltejs/kit").Handle} */
const auth = async ({ event, resolve }) => {
    // Set both local objects to null by default
    event.locals.user = null
    event.locals.session = null


    // Get user and session id from client's cookies
    const userId = event.cookies.get("user")
    const sessionId = event.cookies.get("session")

    // If client does not have both cookies
    if (!userId || !sessionId) {
        return await resolve(event)
    }

    // If cookies are not in valid format
    if (!inputHandler.validate.uuid(userId) || !inputHandler.validate.uuid(sessionId)) {
        // Delete client's cookies
        await deleteAuthCookies(event.cookies)

        return await resolve(event)
    }


    /*
        Get `Session` and connected `User` entries with matching ids from db
        Only get the session if both ids match the client's cookies

        This means in order for a malicious client to access an account by setting their own cookie values,
        they would have to correctly guess a valid `Session.id` and the corresponding `User.id`,
        with random UUIDs this should be impossible to brute force since sessions expire.
    */
    const sessionResponse = await dbActions.session.findUnique({
        id: sessionId,
        userId: userId
    })

    // If query failed
    if (!sessionResponse.success) {
        // Delete client's cookies
        await deleteAuthCookies(event.cookies)

        return await resolve(event)
    }

    const { user, ...session } = sessionResponse.session


    // If `session` is expired
    if (session.expiresAt < new Date()) {
        // Delete client's cookies
        await deleteAuthCookies(event.cookies)

        return await resolve(event)
    }


    // Get date set number of days from now to control when sessions get renewed
    const renewBefore = dateFromNow(settings.session.renewalLead * 24 * (60 ** 2) * 1000)

    // If `session` expires sooner than renew date
    if (session.expiresAt < renewBefore) {

        // Extend expiry date in db for current `Session` entry
        const refreshResponse = await dbActions.session.refreshExpiry(sessionId)

        if (refreshResponse.success) {
            // Update `session` object
            session.expiresAt = refreshResponse.expiryDate
        }
    }


    // Set both local objects
    event.locals.user = user
    event.locals.session = session

    return await resolve(event)
}
// #endregion auth()



// #region privateGuard()

// #region Specific Imports

/*
    https://kit.svelte.dev/docs/load#redirects
    Subroutine to redirect clients to another route
*/
import { redirect } from "@sveltejs/kit"
// #endregion Specific Imports



/** @type {import("@sveltejs/kit").Handle} */
const privateGuard = async ({ event, resolve }) => {
    // If the client has requested an non-existent route
    if (!event.route.id) return await resolve(event)

    // Get if the route the client is requesting is in the private group
    const privateRoute = event.route.id.startsWith("/(main)/(private)/")

    // If the client is requesting a private route and is not logged in
    if (privateRoute && !event.locals.user) {
        // Redirect the client with search params
        redirect(307, `${settings.urls.login}?protected=login&redirectTo=${event.url.pathname+event.url.search}`)
    }

    // Allow the client to access the route
    return await resolve(event)
}
// #endregion privateGuard()

// #endregion Handles



// Export handle sequence to be run on every request
export const handle = sequence(auth, privateGuard)



// #region DOCS

// Resources explaining server hooks
// https://kit.svelte.dev/docs/hooks

// #endregion