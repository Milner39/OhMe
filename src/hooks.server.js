// https://kit.svelte.dev/docs/hooks
// "'Hooks' are app-wide functions you declare that SvelteKit will call in response to specific events..."

// The `event` object represents the request clients make to the server
// Data can be passed down to server-side `load` functions by populating the `event.locals` object

// The `resolve` function renders the route and generates a `Response` for the client




// MARK: Imports
// https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks
// "A helper function for sequencing multiple handle calls in a middleware-like manner."
import { sequence } from "@sveltejs/kit/hooks"

// Import settings
import { settings }  from "$lib/settings"





// MARK: auth
// Import prisma client instance to interact with db
import { client as prismaClient } from "$lib/server/prisma"

// Import error logger to record error details
import { logError } from "$lib/server/errorLogger"


// Define function to delete auth cookies
const deleteAuthCookies = async (cookies) => {
    // Delete client's cookies
    await cookies.delete("user", {
        path: "/",
        secure: false
    })
    await cookies.delete("session", {
        path: "/",
        secure: false
    })
}


// Define handle to manage client authentication
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

    // TODO: Sanitize cookies


    // Get `Session` and connected `User` entries with matching ids from db
    // Only get the session if both ids match the client's cookies
    // This means in order for a malicious client to set their own cookie values,
    // they would have to correctly guess a valid `Session.id` and the corresponding `User.id`,
    // with random UUIDs this should be very secure.
    try {
        let dbResponse = await prismaClient.Session.findUnique({
            // Set field filters
            where: {
                id: sessionId,
                userId: userId
            },
            // Set fields to return
            include: {
                user: {
                    include: {
                        email: true,
                        password: true,
                        sessions: true,
                        friended: true,
                        friendOf: true
                    }
                }
            }
        })

        // If `dbResponse` is not `undefined`
        if (dbResponse) {
            var { user, ...session } = dbResponse
        } else {
            // Delete client's cookies
            await deleteAuthCookies(event.cookies)

            // End handle
            return await resolve(event)
        }

    // Catch errors
    } catch (error) {
        // Log error details
        logError({
            filepath: "src/hooks.server.js",
            message: "Error while fetching Session entry from db using client's cookies",
            arguments: {
                sessionId,
                userId
            },
            error
        })

        // End handle
        return await resolve(event)
    }


    // If `session` is expired
    if (session.expiresAt < new Date()) {
        // Delete client's cookies
        await deleteAuthCookies(event.cookies)

        // End handle
        return await resolve(event)
    }


    // Get date set number of days from now to control when sessions get renewed
    const renewBefore = new Date()
    renewBefore.setDate(renewBefore.getDate() + settings.session.renewalLead)

    // If `session` expires sooner than renew date
    if (session.expiresAt < renewBefore) {
        // Get date set number of days from now to control when sessions expire
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + settings.session.duration)

        // Extend `Session.expiresAt` date in db for current session
        try {
            await prismaClient.Session.update({
                // Set field filters
                where: {
                    id: sessionId
                },
                // Set field data
                data: {
                    expiresAt: expiryDate
                }
            })
            // Update `session` object
            session.expiresAt = expiryDate

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/hooks.server.js",
                message: "Error while extending Session entry expiry date",
                arguments: {
                    sessionId,
                    expiresAt: session.expiresAt,
                    extendTo: expiryDate
                },
                error
            })
        }
    }


    // Set both local objects to their respective objects
    event.locals.user = user
    event.locals.session = session

    // End handle
    return await resolve(event)
}





// MARK: privateGuard
// https://kit.svelte.dev/docs/load#redirects
// "To redirect users, use the redirect helper from @sveltejs/kit to specify the location
//  to which they should be redirected..."
import { redirect } from "@sveltejs/kit"


const privateGuard = async ({ event, resolve }) => {
    // Get if the route the client is requesting is in the private group
    const privateRoute = event.route.id.startsWith("/(main)/(private)/")

    // If the client is requesting a private route and is not logged in
    if (privateRoute && !event.locals.user) {
        // Redirect the client with search params
        redirect(302, `${settings.urls.login}?protected=login&redirectTo=${event.url.pathname+event.url.search}`)
    }

    // Allow the client to access the route
    // End handle
    return await resolve(event)
}





// Export handle sequence to be run on every request
export const handle = sequence(auth, privateGuard)