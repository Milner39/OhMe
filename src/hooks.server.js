// Import function used to run multiple hooks in sequence
import { sequence } from "@sveltejs/kit/hooks"

// Import lucia client
import { client as luciaClient } from "$lib/server/lucia"

const luciaHandle = async ({ event, resolve }) => {
    // Get session id from event cookies
    // "luciaClient.sessionCookieName" is defined in the initialization of the lucia client
    // By default it is "auth_session"
    const sessionId = event.cookies.get(luciaClient.sessionCookieName)

    // If no session cookie, set locals.[user,session] to null and return
    if (!sessionId) {
        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // Validate the session id and get the session and user objects
    const { session, user } = await luciaClient.validateSession(sessionId)


    //TODO: Figure out what this actually does 

    // If session exists and it is fresh
    if (session && session.fresh) {
        const sessionCookie = luciaClient.createSessionCookie(sessionId)
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        })
    }

    // If session does not exist
    if (!session) {
        const sessionCookie = luciaClient.createBlankSessionCookie()
        event.cookie.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        })
    }
    event.locals.user = user
    event.locals.session = session
    return resolve(event)

    //
}

// Export handle to be run
export const handle = sequence(luciaHandle)