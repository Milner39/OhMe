// Import prisma client instance to interact with db
import { client as prismaClient } from "$lib/server/prisma"

// Import inputHandler to make sure validate and sanitize inputs
import { inputHandler } from "$lib/server/inputHandler.js"

// Import error logger to record error details
import { logError } from "$lib/server/errorLogger"

// Import settings
import { settings }  from "$lib/settings"


// MARK: Load
// https://kit.svelte.dev/docs/load#page-data
// Define load function
export const load = async ({ url }) => {
    // https://kit.svelte.dev/docs/load#streaming-with-promises
    // Wrap main script in a function so it can be streamed as a promise
    const verify = async () => {
        // Get URL parameters
        const userId = url.searchParams.get("user")
        const verifyCode = url.searchParams.get("code")


        // If url does not have both search params
        if (!userId || !verifyCode) {
            // End function
            return {
                status: 400,
                errors: { client: "This is not a valid verification link..." }
            }
        }

        // TODO: sanitize url params


        // Get `User` entry to have email verified
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set field filters
                where: {
                    id: userId,
                    email: {
                        verifyCode: verifyCode
                    }
                },
                // Set fields to return
                select: {
                    email: {
                        select: {
                            verified: true,
                            codeSentAt: true
                        }
                    }
                }
            })

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var { email } = dbResponse
            } else {
                // End function
                return {
                    status: 422,
                    errors: { client: "Incorrect verification code..." }
                }
            }

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/verify/+page.server.js",
                message: "Error while fetching User entry from db using user id and verification code from url param",
                arguments: {
                    userId,
                    verifyCode
                },
                error
            })

            // End function
            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..."},
            }
        }


        // If email is already verified
        if (email.verified) {
            // End function
            return {
                status: 409,
                errors: { client: "Your email address if already verified..." }
            }
        }


        // Get the time the last email verification code was sent
        const { codeSentAt } = email
        // If last link was sent more than set number of hours ago
        if (!codeSentAt || codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.email.duration) < new Date()) {
            // End function
            return {
                status: 401,
                errors: { client: "Verification code expired..." }
            }
        }


        // Update `User` entry in db
        try {
            await prismaClient.User.update({
                // Set field filters
                where: {
                    id: userId,
                    email: {
                        verifyCode: verifyCode
                    }
                },
                // Set field data
                data: {
                    email: {
                        update: {
                            verified: true,
                            verifyCode: null,
                            codeSentAt: null
                        }
                    }
                }
            })

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/verify/+page.server.js",
                message: "Error while updating verified status to true for User entry in db",
                arguments: {
                    userId,
                    verifyCode
                },
                error
            })

            // End function
            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..." }
            }
        }


        // End function
        return {
            status: 200
        }
    }


    // End load
    return {
        streamed: verify(url)
    }
}