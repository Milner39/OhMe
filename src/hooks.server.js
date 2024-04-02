// Import function used to run multiple hooks in sequence
import { sequence } from "@sveltejs/kit/hooks"

// Import prisma client
import { client as prismaClient } from "$lib/server/prisma"

// ISSUE: clients can set their own cookies.
// This means if a client were to brute force session ids,
// they could get a match and sign into a user.
// Session cookies need to be made more secure,
// possibly by using a second uuid as a password.
const authHandle = async ({ event, resolve }) => {
    // Get session id from event cookies
    const sessionId = event.cookies.get("session")

    // If no session cookie
    if (!sessionId) {
        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // Check if session with matching id exists in db
    try {
        // Get session and user from db query
        var { user, ...session } = await prismaClient.Session.findUnique({
            // Set conditions
            where: {
                id: sessionId
            },
            // Set which feilds to retrieve from db
            select: {
                id: true,
                expiresAt: true,
                userId: true,
                // Include user feilds
                user: {
                    select: {
                        // NOTE: DO NOT return hashedPassword
                        // Never EVER make hashed passwords visible client-side
                        id: true,
                        username: true,
                        email: true,
                        emailVerified: true,
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
    } catch {
        session = null
        user = null
    }

    // If session with session id does not exist
    if (!session) {
        await event.cookies.delete("session", {path: "."})
        event.locals.user = null
        event.locals.session = null
        return resolve(event)
    }

    // If session expired
    if (session.expiresAt < new Date()) {
        await event.cookies.delete("session", {path: "."})
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
            session = await prismaClient.Session.update({
                where: {
                    id: sessionId
                },
                data: {
                    expiresAt: expiryDate
                }
            })
        } catch (err) {
            console.log(err)
        }
    }

    event.locals.user = user
    event.locals.session = session
    return resolve(event)
}

// Export handle to be run
export const handle = sequence(authHandle)