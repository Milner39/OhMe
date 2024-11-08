// #region Imports
import dbActions from "$lib/server/database/actions/all.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
import { stringHasher } from "$lib/server/utils/hashUtils.js"
import { dateFromNow } from "$lib/client/utils/dateUtils.js"
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
    /**
     * Check if the reset code is correct.
     * 
     * @async
     * 
     * @param {URL} url - The `URL` object of the current page.
     */
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


        // Get `User` entry to have password reset
        const user_fUResponse = await dbActions.user.findUnique({
            id: userId,
            password: {
                resetCode: resetCode,
            }
        })

        // If no `User` entry with given id and password reset code exists
        if (user_fUResponse.error === "No entry found") {
            return {
                status: 422,
                errors: { client: "Incorrect reset code..." }
            }
        }

        // If query failed
        if (!user_fUResponse.success) {
            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..." }
            }
        }


        // Get the time the last password reset code was sent
        const { codeSentAt } = user_fUResponse.user.password

        // If last link was sent more than set number of hours ago
        if (
            !codeSentAt ||
            codeSentAt < dateFromNow(-1 * settings.password.duration * (60 ** 2) * 1000)
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
        checkResetCode: checkCode(url)
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

        // Update `User` entry in db
        const user_uResponse = await dbActions.user.update(
            {
                id: userId,
                password: {
                    resetCode: resetCode,
                    codeSentAt: {
                        gte: unexpired
                    }
                }
            },
            {
                password: {
                    update: {
                        hash: await stringHasher.hash(formData.password),
                        resetCode: null,
                    }
                }
            }
        )

        // Check if there was an error while updating the `User` entry
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
}