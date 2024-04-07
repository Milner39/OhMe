// Import function used to run multiple hooks in sequence
import { sequence } from "@sveltejs/kit/hooks"

// Import prisma client
import { client as prismaClient } from "$lib/server/prisma"

const authHandle = async ({ event, resolve }) => {
    // Get session and user id from event cookies
    const sessionId = event.cookies.get("session")
    const userId = event.cookies.get("user")

    // If no cookies
    if (!sessionId || !userId) {
        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // Check if Session with matching id exists in db
    try {
        // Get session and user from db query
        var { user, ...session } = await prismaClient.Session.findUnique({
            // Set filter feilds
            where: {
                id: sessionId,
                userId: userId
            },
            // Set return feilds
            select: {
                id: true,
                expiresAt: true,
                userId: true,
                // Set user return feilds
                user: {
                    select: {
                        // NOTE: DO NOT return hashedPassword
                        // Never EVER make hashed passwords visible client-side
                        id: true,
                        username: true,
                        email: true,
                        emailVerified: true,
                        emailCodeSentAt: true,
                        web3Wallet: true,
                        // Get the ids of all other user sessions too
                        sessions: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        })
    } catch (err) {
        session = null
        user = null
    }

    // If Session with session id does not exist
    if (!session) {
        await event.cookies.delete("session", {
            path: "/",
            secure: false
        })
        await event.cookies.delete("user", {
            path: "/",
            secure: false
        })

        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // If Session expired
    if (session.expiresAt < new Date()) {
        await event.cookies.delete("session", {
            path: "/",
            secure: false
        })
        await event.cookies.delete("user", {
            path: "/",
            secure: false
        })

        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // Get date 7 days from now
    const refreshDate = new Date()
    refreshDate.setDate(refreshDate.getDate() +7)
    // If Session expires in less than 7 days
    if (session.expiresAt < refreshDate) {
        // Extend expiry date to 21 days from now
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() +21)
        // Make changes to session in the database
        try {
            await prismaClient.Session.update({
                // Set filter feilds
                where: {
                    id: sessionId
                },
                // Set update feilds
                data: {
                    expiresAt: expiryDate
                }
            })
            // Update session object
            session.expiresAt = expiryDate
        } catch (err) {
            console.log("Error at hook.server.js:")
            console.log(err)
        }
    }

    event.locals.user = user
    event.locals.session = session
    return resolve(event)
}

// Export handle to be run
export const handle = sequence(authHandle)