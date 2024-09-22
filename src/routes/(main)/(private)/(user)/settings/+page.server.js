// #region Imports
import dbClient from "$lib/server/database/prisma/prisma.js"
import inputHandler from "$lib/server/inputHandler.js"
import { stringHasher } from "$lib/server/hashUtils.js"
import { emailer } from "$lib/server/emailUtils.js"
import logError from "$lib/server/errorLogger.js"
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


        // TODO: Move to db operations file
        // Update `User.username` in db for client's `User` entry
        try {
            await dbClient.user.update({
                // Set field filters
                where: {
                    id:  user.id
                },
                // Set field data
                data: {
                    username: sanitizedUsername
                }
            })

        // Catch errors
        } catch (error) {
            // Match error code
            switch (error.code) {
                // Code for prisma unique constraint failing
                case "P2002":
                    errors.username = "Username taken"
                    break

                default:
                    // Log error details
                    logError({
                        filepath: "src/routes/(main)/(private)/(user)/settings/+page.server.js",
                        message: "Error while updating username for `User` entry in db",
                        arguments: {
                            username: formData.username
                        },
                        error
                    })

                    notice = "We couldn't update your username, try again later..."
            }

            return {
                status: 503,
                errors,
                notice
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


        // TODO: Move to db operations file
        // Update `User.email.address` in db for client's `User` entry
        try {
            const { email } = await dbClient.user.update({
                // Set field filters
                where: {
                    id:  user.id
                },
                // Set field data
                data: {
                    email: {
                        update: {
                            address: sanitizedEmail,
                            verified: false,
                            verifyCode: crypto.randomUUID(),
                            codeSentAt: new Date()
                        }
                    }
                },
                // Set fields to return
                select: {
                    email: {
                        select: {
                            address: true,
                            verifyCode: true
                        }
                    }
                }
            })

            /*
                Send email with link to verify updated email
                inputHandler.desanitize(email.address) replaces my email in production
            */
            await emailer.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)

        // Catch errors
        } catch (error) {
            // Match error code
            switch (error.code) {
                // Code for prisma unique constraint failing
                case "P2002":
                    errors.email = "Email taken"
                    break

                default:
                    // Log error details
                    logError({
                        filepath: "src/routes/(main)/(private)/(user)/settings/+page.server.js",
                        message: "Error while updating email address for `User` entry in db",
                        arguments: {
                            emailAddress: formData.email
                        },
                        error
                    })

                    notice = "We couldn't update your email address, try again later..."
            }

            return {
                status: 503,
                errors,
                notice
            }
        }


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


        // TODO: Move to db operations file
        // Update `User.password.hash` in db for client's `User` entry
        const hash = await stringHasher.hash(formData.newPassword)

        try {
            await dbClient.user.update({
                // Set field filters
                where: {
                    id: user.id
                },
                // Set field data
                data: {
                    password: {
                        update: {
                            hash: hash
                        }
                    }
                }
            })

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(private)/(user)/settings/+page.server.js",
                message: "Error while updating password hash for `User` entry in db",
                arguments: {
                    passwordHash: hash
                },
                error
            })

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