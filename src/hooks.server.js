// Import function used to run multiple hooks in sequence
import { sequence } from "@sveltejs/kit/hooks"

// Import lucia client
import { client as luciaClient } from "$lib/server/lucia"

const luciaHandle = async ({ event, resolve }) => {
    // Get session id from event cookies
    // "luciaClient.sessionCookieName" is defined in the initialization of the lucia client
    // By default it is "auth_session"
    const sessionId = event.cookies.get(luciaClient.sessionCookieName)

    // If no session cookie
    if (!sessionId) {
        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // Validate the session id and get the session and user objects
    const { session, user } = await luciaClient.validateSession(sessionId)

    // If session with session id does not exist
    if (!session) {
        await event.cookies.delete(luciaClient.sessionCookieName, {path: "."})
    }

    // If session exists
    event.locals.user = user
    event.locals.session = session
    return resolve(event)

    // TODO: Extending session expirery
}

// Export handle to be run
export const handle = sequence(luciaHandle)