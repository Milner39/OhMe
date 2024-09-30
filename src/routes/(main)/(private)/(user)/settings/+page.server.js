// #region Imports
import dbUserActions from "$lib/server/database/actions/user.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
import { stringHasher } from "$lib/server/utils/hashUtils.js"
import { emailer } from "$lib/server/utils/emailUtils.js"
// #endregion



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
    https://kit.svelte.dev/docs/form-actions#named-actions
    Define form actions
*/ 
/** @type {import("./$types").Actions} */
export const actions = {
    // #region username()
    /**
     * Action to update client's username.
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
            errors?: {
                username: String
            }
        }}
     */
    username: async ({ request, locals }) => {
        // Get `user` from locals
        const { user } = locals

        // If client is not logged in
        if (!user) {
            return { status: 401 }
        }

        // IMPROVE: stop users with unverified email making requests


        // Get form data sent by client
        const formData = await getFormData(request)
        
        // If submitted username does not conform to validation checks
        if (!inputHandler.validate.username(formData.username)) {
            return {
                status: 422,
                errors: { username: "Invalid username" }
            }
        }

        // Sanitize username
        const sanitizedUsername = inputHandler.sanitize(formData.username)


        // If username has not changed
        if (user.username === sanitizedUsername) {
            return { status: 200 }
        }


        // Update username in db for client's `User` entry
        const updateResponse = await dbUserActions.update(
            // Filter
            {
                id: user.id
            },

            // Data
            {
                username: sanitizedUsername
            }
        )

        // If there was an error while updating username
        if (!updateResponse.success) {
            if (
                updateResponse.error === "Unique fields already taken" &&
                updateResponse.target.includes("username")
            ) {
                return {
                    status: 422,
                    errors: { username: "Username taken" }
                }
            }

            else {
                return {
                    status: 503,
                    notice: "We couldn't update your username, try again later..."
                }
            }
        }


        return {
            status: 200,
            notice: "Successfully updated your username!"
        }
    },
    // #endregion


    // #region email()
    /**
     * Action to update client's email.
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
            errors?: {
                email: String
            }
        }}
     */
    email: async ({ request, locals }) => {
        /* 
            Variables to hold:
                - notice message
                - error messages
        */
        let notice = null
        let errors = {}


        // Get `user` from locals
        const { user } = locals

        // If client is not logged in
        if (!user) {
            return { status: 401 }
        }

        /*
            Do not prevent the client from changing their email address
            if their `Email` entry is unverified as they would not be able
            to change their address to the correct one if it was initially 
            entered incorrectly.
        */


        // Get form data sent by client
        const formData = await getFormData(request)

        // If submitted email does not conform to validation checks
        if (!inputHandler.validate.email(formData.email)) {
            return {
                status: 422,
                errors: { email: "Invalid email" }
            }
        }

        // Sanitize email
        const sanitizedEmail = inputHandler.sanitize(formData.email.toLowerCase())


        // If email has not changed
        if (user.email.address === sanitizedEmail) {
            return { status: 200 }
        }


        // Update email address in db for client's `User` entry
        const updateResponse = await dbUserActions.update(
            // Filter
            {
                id: user.id
            },

            // Data
            {
                email: {
                    update: {
                        address: sanitizedEmail,
                        verified: false,
                        verifyCode: crypto.randomUUID(),
                        codeSentAt: new Date()
                    }
                }
            }
        )

        // If there was an error while updating email address
        if (!updateResponse.success) {
            if (
                updateResponse.error === "Unique fields already taken" &&
                updateResponse.target.includes("email.address")
            ) {
                return {
                    status: 422,
                    errors: { email: "Email taken" }
                }
            }

            else {
                return {
                    status: 503,
                    notice: "We couldn't update your email address, try again later..."
                }
            }
        }


        // Send email with link to verify updated email
        await emailer.sendVerification(
            "finn.milner@outlook.com", // inputHandler.desanitize(updateResponse.user.email.address),
            user.id, 
            updateResponse.user.email.verifyCode
        )


        return {
            status: 200,
            notice: "Successfully updated your email address!"
        }
    },
    // #endregion


    // #region password()
    /**
     * Action to update client's password.
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
            errors?: {
                password: String
            }
        }}
     */
    password: async ({ request, locals }) => {
        // Get `user` from locals
        const { user } = locals

        // If client is not logged in
        if (!user) {
            return { status: 401 }
        }

        // IMPROVE: stop users with unverified email making requests


        // Get form data sent by client
        const formData = await getFormData(request)
        

        // Check if password is correct
        const correctPassword = await stringHasher.verify(user.password.hash, formData.password)

        // If password is incorrect
        if (!correctPassword) {
            return {
                status: 422,
                errors: { password: "Password incorrect" }
            }
        }


        // Check `formData.password` is different from `formData.newPassword`
        if (formData.password === formData.newPassword) {
            return {
                status: 422,
                errors: {
                    password: "Must not match",
                    newPassword: "Must not match"
                }
            }
        }


        /*
            Do not validate original password as existing passwords 
            may not conform to current validation checks, however these 
            passwords should still be able to be changed.
        */

        // If submitted new password does not conform to validation checks
        if (!inputHandler.validate.password(formData.newPassword)) {
            return {
                status: 422,
                errors: { newPassword: "Invalid password" }
            }
        }


        // Update password hash in db for client's `User` entry
        const updateResponse = await dbUserActions.update(
            // Filter
            {
                id: user.id
            },

            // Data
            {
                password: {
                    update: {
                        hash: await stringHasher.hash(formData.newPassword)
                    }
                }
            }
        )

        // If there was an error while updating password hash
        if (!updateResponse.success) {
            return {
                status: 503,
                notice: "We couldn't update your password, try again later..."
            }
        }


        return {
            status: 200,
            notice: "Successfully updated your password!"
        }
    }
    // #endregion
}