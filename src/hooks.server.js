// Import function used to run multiple hooks in sequence
import { sequence } from "@sveltejs/kit/hooks"

// Import prisma client
import { client as prismaClient } from "$lib/server/prisma"

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
        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // Get date 7 days from now
    const refreshDate = new Date()
    refreshDate.setDate(refreshDate.getDate() +7)
    // If session expires in less than 7 days
    if (session.expiresAt < refreshDate) {
        // Extend expiry date
        // Create new expiry date 21 days from now
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() +21)
        // Make changes to session in the database
        try {
            await prismaClient.Session.update({
                where: {
                    id: sessionId
                },
                data: {
                    expiresAt: expiryDate
                }
            })
        } catch(err) {
            console.log(err)
        }
    }

    event.locals.user = user
    event.locals.session = session
    return resolve(event)
}

// Export handle to be run
export const handle = sequence(luciaHandle)