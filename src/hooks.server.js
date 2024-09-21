// #region General Imports

/*
    https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks
    Subroutine to run hooks sequentially
*/
import { sequence } from "@sveltejs/kit/hooks"

import { settings }  from "$lib/settings"
// #endregion



// #region Handles
    // #region auth()
        // #region Specific Imports
import dbClient from "$lib/server/prisma.js"
import inputHandler from "$lib/server/inputHandler.js"
import logError from "$lib/server/errorLogger.js"
import { dateFromNow } from "$lib/utils/dateUtils"
        // #endregion



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


// TODO: Move to db operations file
/**
 * Get a `Session` entry and connected `User` entry from the database.
   Only if the ids of the `Session` and `User` are defined.
 * @async 
 * 
 * 
 * @param {{
        id: String,
        userId: String,
        "": any[]
    }} filter - The filter used to search the database.
 * 
 * 
 * @returns {Promise<
        null |
        {
            user: {"": any[]},
            "": any[]
        }
    >}
 * - No database results?: `null`
 * - Else: `Session` entry and connected `User` entry.
 */
const secure_getSessionFromDB = async (filter) => {
    if (
        typeof filter.id !== "string" || 
        typeof filter.userId !== "string"
    ) return null

    try {
        const dbResponse = await dbClient.session.findUnique({
            // Set field filters
            where: filter,
            // Set fields to return
            include: {
                user: {
                    include: {
                        email: true,
                        password: true,
                        sessions: true,
                        frRqSent: true,
                        frRqReceived: true
                    }
                }
            }
        })

        return dbResponse

    // Catch errors
    } catch (error) {
        // Log error details
        logError({
            filepath: "src/hooks.server.js",
            message: "Error while fetching `Session` entry from db",
            arguments: {
                where: filter
            },
            error
        })

        return null
    }
}


// TODO: Move to db operations file
/**
 * Update the expiry date of a `Session` entry.
 * @async
 * 
 * 
 * @param {{
        id: string,
        "": any[]
    }} filter - The filter used to search the database.
 * 
 * @param {Date} date - The new expiry date.
 * 
 * 
 * @returns {Promise<Boolean>}
 * A `Boolean` to indicate if the `Session` was updated.
 */
const setSessionExpiry = async (filter, date) => {
    if (typeof filter.id !== "string") return false

    try {
        await dbClient.session.update({
            // Set field filters
            where: filter,
            // Set field data
            data: {
                expiresAt: date
            }
        })

        return true

    // Catch errors
    } catch (error) {
        // Log error details
        logError({
            filepath: "src/hooks.server.js",
            message: "Error while setting `Session` entry expiry date",
            arguments: {
                sessionId,
                expiresAt: session.expiresAt,
                extendTo: expiryDate
            },
            error
        })

        return false
    }
}
        // #endregion


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
        // End handle
        return await resolve(event)
    }

    // If cookies are not in valid format
    if (!inputHandler.validate.uuid(userId) || !inputHandler.validate.uuid(sessionId)) {
        // Delete client's cookies
        await deleteAuthCookies(event.cookies)

        // End handle
        return await resolve(event)
    }


    /*
        Get `Session` and connected `User` entries with matching ids from db
        Only get the session if both ids match the client's cookies

        This means in order for a malicious client to access an account by setting their own cookie values,
        they would have to correctly guess a valid `Session.id` and the corresponding `User.id`,
        with random UUIDs this should be impossible to brute force since sessions expire.
    */
    const sessionEntry = await secure_getSessionFromDB({ 
        id: sessionId,
        userId: userId
    })

    // If no session found
    if (!sessionEntry) {
        // Delete client's cookies
        await deleteAuthCookies(event.cookies)

        // End handle
        return await resolve(event)
    }

    const { user, ...session } = sessionEntry


    // If `session` is expired
    if (session.expiresAt < new Date()) {
        // Delete client's cookies
        await deleteAuthCookies(event.cookies)

        // End handle
        return await resolve(event)
    }


    // Get date set number of days from now to control when sessions get renewed
    const renewBefore = dateFromNow(settings.session.renewalLead * 24 * (60 ** 2) * 1000)

    // If `session` expires sooner than renew date
    if (session.expiresAt < renewBefore) {

        // Get date set number of days from now to control when sessions expire
        const expiryDate = dateFromNow(settings.session.duration * 24 * (60 ** 2) * 1000)

        // Extend expiry date in db for current session
        const sessionExtended = await setSessionExpiry({ id: sessionId }, expiryDate)

        if (sessionExtended) {
            // Update `session` object
            session.expiresAt = expiryDate
        }
    }


    // Set both local objects
    event.locals.user = user
    event.locals.session = session

    // End handle
    return await resolve(event)
}
    // #endregion



    // #region privateGuard()
        // #region Specific Imports

/*
    https://kit.svelte.dev/docs/load#redirects
    Subroutine to redirect clients to another route
*/
import { redirect } from "@sveltejs/kit"
        // #endregion



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
    // End handle
    return await resolve(event)
}
    // #endregion

// #endregion



// Export handle sequence to be run on every request
export const handle = sequence(auth, privateGuard)



// #region DOCS

// Resources explaining server hooks
// https://kit.svelte.dev/docs/hooks

// #endregion