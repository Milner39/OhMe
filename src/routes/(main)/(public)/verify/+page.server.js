// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
import logError from "$lib/server/utils/errorLogger.js"
import { settings }  from "$lib/settings.js"
// #endregion



// #region load()
/*
    Define load subroutine to:
    - Get the `user` and `code` search parameters.

    - Check if search parameters are valid.

    - Check if reset code is correct.

    - Set the matching `User` entry's email to verified.
*/
/** @type {import("./$types").PageServerLoad} */
export const load = async ({ url }) => {
    // https://kit.svelte.dev/docs/load#streaming-with-promises
    // Wrap main script in a function so it can be streamed as a promise
    // TODO: Unwrap
    const verify = async () => {
        // Get search parameters
        const userId = url.searchParams.get("user")
        const verifyCode = url.searchParams.get("code")

        // If search params are not valid
        if (!inputHandler.validate.uuid(userId) || !inputHandler.validate.uuid(verifyCode)) {
            return {
                status: 400,
                errors: { client: "This is not a valid reset link..." }
            }
        }


        // TODO: Move to db operations file
        // Get `User` entry to have email verified
        try {
            const dbResponse = await dbClient.user.findUnique({
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

            // If `dbResponse` is `null`
            if (!dbResponse) {
                return {
                    status: 422,
                    errors: { client: "Incorrect verification code..." }
                }
            }

            var { email } = dbResponse

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/verify/+page.server.js",
                message: "Error while fetching `User` entry from db using user id and verification code from url param",
                arguments: {
                    userId,
                    verifyCode
                },
                error
            })

            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..."},
            }
        }


        // If email is already verified
        if (email.verified) {
            return {
                status: 409,
                errors: { client: "Your email address if already verified..." }
            }
        }


        // Get the time the last email verification code was sent
        const { codeSentAt } = email
        // If last link was sent more than set number of hours ago
        if (
            !codeSentAt || 
            codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.email.duration) < new Date()
        ) {
            return {
                status: 401,
                errors: { client: "Verification code expired..." }
            }
        }


        // TODO: Move to db operations file
        // Update `User` entry in db
        try {
            await dbClient.user.update({
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
                message: "Error while updating verified status to true for `User` entry in db",
                arguments: {
                    userId,
                    verifyCode
                },
                error
            })

            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..." }
            }
        }


        return {
            status: 200
        }
    }


    return {
        streamed: verify(url)
    }
}