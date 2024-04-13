// https://kit.svelte.dev/docs/hooks
// "'Hooks' are app-wide functions you declare that SvelteKit will call in response to specific events..."

// The `event` object represents the request clients make to the server
// Data can be passed down to server-side `load` functions by populating the `event.locals` object

// The `resolve` function renders the route and generates a `Response` for the client

// https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks
// "A helper function for sequencing multiple handle calls in a middleware-like manner."
import { sequence } from "@sveltejs/kit/hooks"

// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// Define hook to handle client authentication
const authHandle = async ({ event, resolve }) => {
    // Get user and session id from client's cookies
    const userId = event.cookies.get("user")
    const sessionId = event.cookies.get("session")

    // If client does not have both cookies
    if (!userId || !sessionId) {
        // Set both local objects to null
        event.locals.user = null
        event.locals.session = null

        // Return response
        return resolve(event)
    }

    // Check if Session entry with matching id exists in db
    // Only get the Session if it has a User relation with a matching id
    // This means in order for a malicious client to set their own cookie values,
    // they would have to correctly guess a valid Session id and the corresponding User id,
    // with random UUIDs this should be very secure.
    try {
        let dbResponse = await prismaClient.Session.findUnique({
            // Set filter feilds
            where: {
                id: sessionId,
                userId: userId
            },
            // Set Session return feilds
            select: {
                id: true,
                expiresAt: true,
                userId: true,
                // Set User return feilds
                user: {
                    select: {
                        id: true,
                        username: true,
                        web3Wallet: true,
                        // Set Email return feilds
                        email: {
                            select: {
                                // NOTE: do not return `verifyCode`,
                                // possible security concerns but unlikely
                                id: true,
                                address: true,
                                verified: true,
                                codeSentAt: true
                            }
                        },
                        // Set Password return feilds
                        password: {
                            select: {
                                // NOTE: DO NOT return `hash`
                                // NEVER EVER make hashed passwords visible client-side

                                // NOTE: do not return `resetCode`,
                                // possible security concerns but unlikely
                                id: true,
                                codeSentAt: true
                            }
                        }
                    }
                }
            }
        })
        // If `dbResponse` is not null (Matching Session found)
        if (dbResponse) {
            var { user, ...session} = dbResponse
        }
    } catch (err) {
        // Catch errors
        console.error("Error at hook.server.js:")
        console.error(err)
    }

    // If `session` undefined
    if (!session) {
        // Delete client's cookies
        await event.cookies.delete("session", {
            path: "/",
            secure: false
        })
        await event.cookies.delete("user", {
            path: "/",
            secure: false
        })

        // Set both local objects to null
        event.locals.user = null
        event.locals.session = null

        // Return response
        return resolve(event)
    }

    // If Session is expired
    if (session.expiresAt < new Date()) {
        // Delete client's cookies
        await event.cookies.delete("session", {
            path: "/",
            secure: false
        })
        await event.cookies.delete("user", {
            path: "/",
            secure: false
        })

        // Set both local objects to null
        event.locals.user = null
        event.locals.session = null

        // Return response
        return resolve(event)
    }

    // Get date 7 days from now
    const renewDate = new Date()
    renewDate.setDate(renewDate.getDate() +7)

    // If Session expires in less than 7 days
    if (session.expiresAt < renewDate) {
        // Get date 21 days from now
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() +21)

        // Extend `expiresAt` date
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
            // Update `session` object
            session.expiresAt = expiryDate
        } catch (err) {
            // Catch errors
            console.error("Error at hook.server.js:")
            console.error(err)
        }
    }

    // Set both local objects to corresponding values
    event.locals.user = user
    event.locals.session = session

    // Return response
    return resolve(event)
}

// Export handle sequence to be run on events
export const handle = sequence(authHandle)