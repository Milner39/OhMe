// TODO: Move to +page.server.js because this is client-side safe
// #region load()
/*
    Define load subroutine to:
    - Get the `mode` search parameter.

    - Set `mode` to a default value if it is not one
      of the valid options.

    - Return the `mode` client-side.
*/
/** @type {import("./$types").PageServerLoad} */
export const load = async ({ url }) => {
    // Get the `mode` search parameter
    let mode = url.searchParams.get("mode")

    // Set `mode` to default value if not one of the valid options
    mode = ["login", "register", "reset"].includes(mode) ? mode : "login"

    // Return the form mode
    return { mode }
}
// #endregion





// #region Imports
import dbClient from "$lib/server/prisma.js"
import inputHandler from "$lib/server/inputHandler.js"
import { stringHasher } from "$lib/server/hashUtils.js"
import { emailer } from "$lib/server/emailUtils.js"
import logError from "$lib/server/errorLogger.js"
import { dateFromNow } from "$lib/utils/dateUtils"
import { settings }  from "$lib/settings.js"
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


/**
 * Set the cookies used fir authentication 
   in the client's browser.
 * @async
 * 
 * 
 * @param {import("@sveltejs/kit").Cookies} cookies - 
   The SvelteKit `Cookies` object provided by a handle.
 *
 * @param {String} userId 
 * 
 * @param {String} sessionId 
 */
const setAuthCookies = async (cookies, userId, sessionId) => {
    // Set client's cookies
    cookies.set("user", userId, {
        path: "/",
        maxAge: 1000000000,  
        httpOnly: true,
        sameSite: "strict",
        secure: false
    })
    cookies.set("session", sessionId, {
        path: "/",
        maxAge: 1000000000,
        httpOnly: true,
        sameSite: "strict",
        secure: false
    })
}
    // #endregion



/*
    https://kit.svelte.dev/docs/form-actions#named-actions
    Define form actions
*/ 
/** @type {import("./$types").Actions} */
export const actions = {
    // #region login()
    /**
     * Action to log the client into an existing `User` entry.
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
            errors?: {
                email?: String,
                password?: String
            }
        }}
     */
    login: async ({ request, cookies, locals }) => {
        // If client is logged in
        if (locals.user) {
            return { status: 401 }
        }


        // Get form data sent by client
        const formData = await getFormData(request)

        /*
            Do not validate form inputs as existing credentials may not 
            conform to current validation checks, however these users
            should still be able to log in.
        */


        // TODO: Move to db operations file
        // Get password hash of `User` entry to be logged into
        try {
            const dbResponse = await dbClient.user.findFirst({
                // Set field filters
                where: {
                    email: {
                        address: inputHandler.sanitize(formData.email.toLowerCase())
                    }
                },
                // Set fields to return
                select: {
                    id: true,
                    password: {
                        select: {
                            hash: true
                        }
                    }
                }
            })

            // If `dbResponse` is not `null`
            if (dbResponse) {
                var { password, ...user } = dbResponse
            }
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error while fetching `User` entry from db using form-submitted email address",
                arguments: {
                    action: "login",
                    emailAddress: formData.email
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't log you in, try again later..."
            }
        }

        
        let correctPassword = false

        /*
            If `User` entry with matching credentials does not exist, `null` will be returned,
            in which case instead of verifying `User.password.hash`, the `stringHasher.failVerify()` 
            subroutine that simulates the time it would take to verify a found hash is executed.
        */
        if (!password) {
            await stringHasher.failVerify()
        } else {
            correctPassword = await stringHasher.verify(password.hash, formData.password)
        }
        /*
            This is done because returning immediately allows malicious clients to figure out
            valid emails from response times, allowing them to only focus on guessing passwords 
            in brute-force attacks. As a preventive measure, use the `stringHasher.failVerify()` 
            subroutine to replicate the response time of a request that submits a valid username.
        */


        if (!correctPassword) {
            return {
                status: 401,
                errors: {
                    email: "Email or password incorrect",
                    password: "Email or password incorrect"
                }
            }
        }


        // Get date set number of days from now to control when sessions expire
        const expiryDate = dateFromNow(settings.session.duration * 24 * (60 ** 2) * 1000)

        // TODO: Move to db operations file
        // Create `Session` entry connected to a `User` in db
        try {
            const dbResponse = await dbClient.User.update({
                // Set field filters
                where: {
                    id: user.id
                },
                // Set field data
                data: {
                    sessions: {
                        create: {
                            expiresAt: expiryDate
                        }
                    }
                },
                // Set fields to return
                select: {
                    sessions: {
                        select: {
                            id: true
                        }
                    }
                }
            })

            var { sessions } = dbResponse
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js", 
                message: "Error while creating `Session` entry in db",
                arguments: {
                    action: "login",
                    userId: user.id
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't log you in, try again later..."
            }
        }


        // Set client's cookies
        await setAuthCookies(cookies, user.id, sessions.at(-1).id)

        return {
            status: 200,
            notice: "Successfully logged in!"
        }
    },
    // #endregion


    // #region register()
    /**
     * Action to create a `User` entry then log the client into it.
     * @async
     * 
     * @param {import("@sveltejs/kit").RequestEvent} requestEvent 
     * 
     * @returns {{
            status: Number,
            notice?: String
            errors?: {
                username?: String,
                email?: String,
                password?: String
            }
        }}
     */
    register: async ({ request, cookies, locals }) => {
        // If client is logged in
        if (locals.user) {
            return { status: 401 }
        }


        // Variable to hold error messages
        let errors = {}


        // Get form data sent by client
        const formData = await getFormData(request)

        // If submitted username does not conform to validation checks
        if (!inputHandler.validate.username(formData.username)) {
            errors.username = "Invalid username"
        }

        // If submitted email does not conform to validation checks
        if (!inputHandler.validate.email(formData.email)) {
            errors.email = "Invalid email"
        }

        // If submitted password does not conform to validation checks
        if (!inputHandler.validate.password(formData.password)) {
            errors.password = "Invalid password"
        }

        // If form inputs have failed validation checks
        if (Object.keys(errors).length > 0) {
            return {
                status: 422,
                errors
            }
        }


        // Sanitize username and email
        const sanitizedUsername = inputHandler.sanitize(formData.username)
        const sanitizedEmail = inputHandler.sanitize(formData.email.toLowerCase())


        // TODO: Move to db operations file
        // Get `User` entries with the same username or email as submitted by client
        try {
            const dbResponse = await dbClient.User.findMany({
                // Set field filters
                where: {
                    OR: [
                        {
                            username: sanitizedUsername
                        },
                        {
                            email: {
                                address: sanitizedEmail
                            }
                        }
                    ]
                },
                // Set fields to be returned
                select: {
                    username: true,
                    email: {
                        select: {
                            address: true
                        }
                    }
                }
            })

            // Check if username or email match for each `User` entry returned
            for (const user of dbResponse) {
                if (user.username === sanitizedUsername) {
                    errors.username = "Username taken"
                }
                if (user.email.address === sanitizedEmail) {
                    errors.email = "Email taken"
                }
            }
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error while fetching `User` entries from db using form-submitted username and email address",
                arguments: {
                    action: "register",
                    username: formData.username,
                    emailAddress: formData.email
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't register your account, try again later..."
            }
        }

        // If username or email is taken
        if (Object.keys(errors).length > 0) {
            return {
                status: 409,
                errors
            }
        }


        // Get date set number of days from now to control when sessions expire
        const expiryDate = dateFromNow(settings.session.duration * 24 * (60 ** 2) * 1000)

        // TODO: Move to db operations file
        // Create `User` entry connected to created `Session` entry in db
        try {
            const dbResponse = await dbClient.User.create({
                // Set field data
                data: {
                    username: sanitizedUsername,
                    email: {
                        create: {
                            address: sanitizedEmail,
                            verifyCode: crypto.randomUUID(),
                            codeSentAt: new Date()
                        }
                    },
                    password: {
                        create: {
                            hash: await stringHasher.hash(formData.password)
                        }
                    },
                    sessions: {
                        create: {
                            expiresAt: expiryDate
                        }
                    }
                },
                // Set fields to return
                select: {
                    id: true,
                    email: {
                        select: {
                            address: true,
                            verifyCode: true
                        }
                    },
                    sessions: {
                        select: {
                            id: true
                        }
                    }
                }
            })


            var { sessions, email, ...user } = dbResponse

            /*
                Send email with link to verify updated email
                inputHandler.desanitize(email.address) replaces my email in production
            */
            await emailer.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error while creating `User` entry in db",
                arguments: {
                    action: "register",
                    username: formData.username,
                    emailAddress: formData.email
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't register your account, try again later..."
            }
        }


        // Set client's cookies
        await setAuthCookies(cookies, user.id, sessions.at(-1).id)

        return {
            status: 200,
            notice: "Successfully registered your account! Check your inbox for a email verification link"
        }
    },
    // #endregion


    // #region reset()
    /**
     * Action to send a password reset email to the submitted email address.
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
    reset: async ({ request, locals }) => {
        // If client is logged in
        if (locals.user) {
            return { status: 401 }
        }

        // Get form data sent by client
        const formData = await getFormData(request)

        /*
            Do not validate email as existing email addresses may not 
            conform to current validation checks, however these users 
            should still be able to reset password
        */


        // TODO: Move to db operations file
        // Get `User` entry to send password reset email
        try {
            const dbResponse = await dbClient.user.findFirst({
                // Set field filters
                where: {
                    email: {
                        address: inputHandler.sanitize(formData.email.toLowerCase())
                    }
                },
                // Set fields to return
                select: {
                    id: true,
                    password: {
                        select: {
                            codeSentAt: true
                        }
                    }
                }
            })

            // If `dbResponse` is not `null`
            if (dbResponse) {
                var { password, ...user } = dbResponse
            } else {
                return {
                    status: 401,
                    errors: { email: "Email incorrect" }
                }
            }

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error while fetching `User` entry from db using form-submitted email address",
                arguments: {
                    action: "reset",
                    emailAddress: formData.email
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }


        // Get the time the last password reset code was sent
        const { codeSentAt } = password

        // If last link was sent less than set number of hours ago
        if (
            codeSentAt && 
            codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.password.cooldown) > new Date()
        ) {
            return {
                status: 422,
                errors: { email: "Wait between requesting resets"}
            }
        }


        // TODO: Move to db operations file
        // Update `User` entry with new password reset code in db 
        try {
            const dbResponse = await dbClient.User.update({
                // Set field filters
                where: {
                    id: user.id
                },
                // Set field data
                data: {
                    password: {
                        update: {
                            resetCode: crypto.randomUUID(),
                            codeSentAt: new Date()
                        }
                    }
                },
                // Set fields to return
                select: {
                    email: {
                        select: {
                            address: true
                        }
                    },
                    password: {
                        select: {
                            resetCode: true
                        }
                    }
                }
            })


            const { email, password } = dbResponse

            /*
                Send email with link to reset password
                inputHandler.desanitize(email.address) replaces my email
            */
            await emailer.sendPasswordReset("finn.milner@outlook.com", user.id, password.resetCode)
        
        // Catch errors
        } catch (error) {
            console.log(error)
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error updating `User` entry in db with new password reset code",
                arguments: {
                    action: "reset",
                    userId: user.id
                },
                error
            })

            return {
                status: 503,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }


        return {
            status: 200,
            notice: "Success! Check your inbox for a password reset link"
        }
    }
}