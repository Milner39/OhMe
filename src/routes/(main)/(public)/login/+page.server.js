// #region Imports
import dbActions from "$lib/server/database/actions/all.js"
import { getFormData } from "$lib/client/utils/formActionUtils.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
import { stringHasher } from "$lib/server/utils/hashUtils.js"
import { emailer } from "$lib/server/utils/emailUtils.js"
import { dateFromNow } from "$lib/client/utils/dateUtils.js"
import { settings }  from "$lib/settings.js"
// #endregion



// #region actions
    // #region Extras
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


        // Get password hash of `User` entry to be logged into
        const user_fUResponse = await dbActions.user.findUnique({
            email: {
                address: inputHandler.sanitize(formData.email.toLowerCase())
            }
        })

        // Check if there was an error while getting the `User` entry
        if (
            user_fUResponse.error &&
            user_fUResponse.error !== "No entry found"
        ) {
            return {
                status: 503,
                notice: "We couldn't log you in, try again later..."
            }
        }


        // Get `User` entry data
        const { 
            password: passwordEntry = null, 
            ...userEntry 
        } = user_fUResponse.user || {}

        
        // Check if submitted password matches hash in db
        let correctPassword = false

        /*
            If `User` entry with matching credentials does not exist, `null` will be returned,
            in which case instead of verifying `User.password.hash`, the `stringHasher.failVerify()` 
            subroutine executed to simulate the time it would take to verify a real hash.
        */
        if (!passwordEntry) {
            await stringHasher.failVerify()
        } else {
            correctPassword = await stringHasher.verify(passwordEntry.hash, formData.password)
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


        // Get date set number of days from now to control when session expires
        const expiryDate = dateFromNow(settings.session.duration * 24 * (60 ** 2) * 1000)

        // Create `Session` entry connected to a `User` entry
        const session_cResponse = await dbActions.session.create({
            expiresAt: expiryDate,
            user: {
                connect: {
                    id: userEntry.id
                }
            }
        })

        // Check if there was an error while creating the `Session` entry
        if (!session_cResponse.success) {
            return {
                status: 503,
                notice: "We couldn't log you in, try again later..."
            }
        }


        // Set client's cookies
        await setAuthCookies(cookies, userEntry.id, session_cResponse.session.id)

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

        // Get date set number of days from now to control when session expires
        const expiryDate = dateFromNow(settings.session.duration * 24 * (60 ** 2) * 1000)

        // Create a `User` and `Session` entry
        const user_cResponse = await dbActions.user.create({
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
        })

        // Check if there was an error while creating the `User` entry
        if (!user_cResponse.success) {
            if (user_cResponse.error === "Unique fields already taken") {
                return {
                    status: 422,
                    errors: {
                        username: user_cResponse.target.includes("username") ? "Username taken" : null,
                        email: user_cResponse.target.includes("email.address") ? "Email taken" : null
                    }
                }
            }

            else {
                return {
                    status: 503,
                    notice: "We couldn't register your account, try again later..."
                }
            }
        }


        // Send email with link to verify email
        await emailer.sendVerification(
            "finn.milner@outlook.com", // inputHandler.desanitize(user_cResponse.user.email.address),
            user_cResponse.user.id, 
            user_cResponse.user.email.verifyCode
        )


        // Set client's cookies
        await setAuthCookies(
            cookies, 
            user_cResponse.user.id,
            user_cResponse.user.sessions.at(-1).id  // Last session created
        )

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


        // Get `User` entry to send password reset email
        const user_fUResponse = await dbActions.user.findUnique({
            email: {
                address: inputHandler.sanitize(formData.email.toLowerCase())
            }
        })

        // Check if there was an error while getting the `User` entry
        if (
            user_fUResponse.error &&
            user_fUResponse.error !== "No entry found"
        ) {
            return {
                status: 503,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }

        // Check if there is no `User` entry with the submitted email
        if (!user_fUResponse.success) {
            return {
                status: 401,
                errors: { email: "Email incorrect" }
            }
        }


        // Get the time the last password reset code was sent
        const { password } = user_fUResponse.user

        // If last link was sent less than set number of hours ago
        if (
            password.codeSentAt && 
            password.codeSentAt > dateFromNow(settings.password.cooldown * -1 * (60 ** 2) * 1000)
        ) {
            return {
                status: 422,
                errors: { email: "Wait between requesting resets"}
            }
        }


        // Update `User` entry with new password reset code in db 
        const user_uResponse = await dbActions.user.update(
            { id: user_fUResponse.user.id },
            {
                password: {
                    update: {
                        resetCode: crypto.randomUUID(),
                        codeSentAt: new Date()
                    }
                }
            }
        )
        
        // Check if there was an error while updating the `User` entry
        if (!user_uResponse.success) {
            return {
                status: 503,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }


        // Send email with link to reset password
        await emailer.sendPasswordReset(
            "finn.milner@outlook.com", // inputHandler.desanitize(user_uResponse.user.email.address),
            user_uResponse.user.id, 
            user_uResponse.user.password.resetCode
        )


        return {
            status: 200,
            notice: "Success! Check your inbox for a password reset link"
        }
    }
}