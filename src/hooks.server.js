import { sequence } from "@sveltejs/kit/hooks"
import { client as luciaClient } from "$lib/server/lucia"

const luciaHandle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(luciaClient.sessionCookieName)
    if (!sessionId) {
        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    const { session, user } = await luciaClient.validateSession(sessionId)
    if (session && session.fresh) {
        const sessionCookie = luciaClient.createSessionCookie(sessionId)
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        })
    }
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
}

export const handle = sequence(luciaHandle)