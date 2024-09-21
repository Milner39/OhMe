// #region Imports
import dbClient from "$lib/server/prisma.js"
import inputHandler from "$lib/server/inputHandler.js"
import { dateFromNow } from "$lib/utils/dateUtils.js"
import { stringHasher } from "$lib/server/hashUtils.js"
import logError from "$lib/server/errorLogger.js"
import { settings }  from "$lib/settings.js"
// #endregion



// #region load()
/*
    Define load subroutine to:
    - Get the `user` and `code` search parameters.

    - Check if search parameters are valid.

    - Check if reset code is correct.
*/
/** @type {import("./$types").PageServerLoad} */
export const load = async ({ url }) => {
    // https://kit.svelte.dev/docs/load#streaming-with-promises
    // Wrap main script in a async subroutine so it can be streamed as a promise
    // TODO: Unwrap
    const checkCode = async (url) => {
        // Get search parameters
        const userId = url.searchParams.get("user")
        const resetCode = url.searchParams.get("code")

        // If search params are not valid
        if (!inputHandler.validate.uuid(userId) || !inputHandler.validate.uuid(resetCode)) {
            return {
                status: 400,
                errors: { client: "This is not a valid reset link..." }
            }
        }


        // TODO: Move to db operations file
        // Get `User` entry to have password reset
        try {
            const dbResponse = await dbClient.user.findUnique({
                // Set field filters
                where: {
                    id: userId,
                    password: {
                        resetCode: resetCode
                    }
                },
                // Set fields to return
                select: {
                    password: {
                        select: {
                            codeSentAt: true
                        }
                    }
                }
            })

            // If `dbResponse` is `null`
            if (!dbResponse) {
                return {
                    status: 422,
                    errors: { client: "Incorrect reset code..." }
                }
            }

            var { password } = dbResponse
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/reset/+page.server.js",
                message: "Error while fetching `User` entry from db using user id and reset code from url param",
                arguments: {
                    userId,
                    resetCode
                },
                error
            })

            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..." }
            }
        }


        // Get the time the last password reset code was sent
        const { codeSentAt } = password

        // If last link was sent more than set number of hours ago
        if (
            !codeSentAt || 
            codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.password.duration) < new Date()
        ) {
            return {
                status: 401,
                errors: { client: "Reset code expired..." }
            }
        }


        return {
            status: 200
        }
    }


    return {
        streamed: checkCode(url)
    }
}
// #endregion load()





// #region actions
    // #region Extras
/**
 * Get an `Object` containing a key for each input 
   in a form submission and their respective values.
 * @async
 *
 * 
 * @param {
   import("@sveltejs/kit").RequestEvent["request"]
} request - The `.request` property of a `RequestEvent`.
*
* 
* @returns {Promise<{
    "": any[]
}>}
*/
const getFormData = async (request) => {
    return Object.fromEntries(await request.formData())
}
    // #endregion



/*
    https://kit.svelte.dev/docs/form-actions#default-actions
    Define form action
*/ 
/** @type {import("./$types").Actions} */
export const actions = {
    // #region default()
    /**
     * Action to set a `User` entry's username after verifying
       it's id and password reset code
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            errors?: {
                password: String
            },
            notice?: String
        }}
     */
    default: async ({ url, request }) => {
        // Get search parameters
        const userId = url.searchParams.get("user")
        const resetCode = url.searchParams.get("code")

        // If url does not have both search params
        if (!userId || !resetCode) {
            return {
                status: 400
            }
        }

        // If search params are not valid
        if (!inputHandler.validate.uuid(userId) || !inputHandler.validate.uuid(resetCode)) {
            return { status: 400 }
        }


        // Get form data sent by client
        const formData = await getFormData(request)

        // If submitted password does not conform to validation checks
        if (!inputHandler.validate.password(formData.password)) {
            return {
                status: 422,
                errors: { password: "Invalid password" }
            }
        }


        // Get date set number of hours in the past to filter out expired codes
        const unexpired = dateFromNow(-1 * settings.password.duration * (60 ** 2) * 1000)

        // TODO: Move to db operations file
        // Update `User` entry in db
        try {
            await dbClient.user.update({
                // Set field filters
                where: {
                    id: userId,
                    password: {
                        resetCode: resetCode,
                        codeSentAt: {
                            gte: unexpired
                        }
                    }
                },
                // Set field data
                data: {
                    password: {
                        update: {
                            hash: await stringHasher.hash(formData.password),
                            resetCode: null,
                        }
                    }
                }
            })
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/reset/+page.server.js",
                message: "Error while updating password for `User` entry in db",
                arguments: {
                    userId,
                    resetCode
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
}