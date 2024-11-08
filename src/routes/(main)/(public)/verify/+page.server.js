// #region Imports
import dbActions from "$lib/server/database/actions/all.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
import { dateFromNow } from "$lib/client/utils/dateUtils.js"
import { settings }  from "$lib/settings.js"
// #endregion



// #region load()
/*
    Define load subroutine to:
    - Get the `user` and `code` search parameters.

    - Check if search parameters are valid.

    - Check if verify code is correct.

    - Set the matching `User` entry's email to verified.
*/
/** @type {import("./$types").PageServerLoad} */
export const load = async ({ url }) => {

    // https://kit.svelte.dev/docs/load#streaming-with-promises
    // Wrap main script in a function so it can be streamed as a promise
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


        // Get `User` entry to have email verified
        const user_fUResponse = await dbActions.user.findUnique({
            id: userId,
            email: {
                verifyCode: verifyCode,
            }
        })

        // If no `User` entry with given id and email verification code exists
        if (user_fUResponse.error === "No entry found") {
            return {
                status: 422,
                errors: { client: "Incorrect verify code..." }
            }
        }

        // If query failed
        if (!user_fUResponse.success) {
            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..." }
            }
        }


        // If email is already verified
        if (user_fUResponse.user.email.verified) {
            return {
                status: 409,
                errors: { client: "Your email address if already verified..." }
            }
        }

        // Get the time the email verification code was sent
        const { codeSentAt } = user_fUResponse.user.email

        // If link was sent more than set number of hours ago
        if (
            !codeSentAt || 
            codeSentAt < dateFromNow(-1 * settings.email.duration * (60 ** 2) * 1000)
        ) {
            return {
                status: 401,
                errors: { client: "Verification code expired..." }
            }
        }


        // Update `User` entry in db
        const user_uResponse = await dbActions.user.update(
            {
                id: userId,
                email: {
                    verifyCode: verifyCode
                }
            },
            {
                email: {
                    update: {
                        verified: true,
                        verifyCode: null,
                    }
                }
            }
        )

        // If query failed
        if (!user_uResponse.success) {
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