// MARK: Load
// https://kit.svelte.dev/docs/load#page-data
// Define load function
export const load = async ({ url }) => {
    // Get URL parameter
    let mode = url.searchParams.get("mode")

    // Set `mode` to default value if not one of the defined options
    mode = ["login", "register", "reset"].includes(mode) ? mode : "login"

    // Return the `mode`
    return { mode }
}





// Import prisma client instance to interact with db
import { client as prismaClient } from "$lib/server/prisma"

// Import inputHandler to validate and sanitize inputs
import { inputHandler } from "$lib/server/inputHandler.js"

// Import hashing functions to hash & verify hashes
import { stringHasher, failHash } from "$lib/server/argon"

// Import mailer to send emails
import { Emailer } from "$lib/server/mailer"

// Import error logger to record error details
import { logError } from "$lib/server/errorLogger"

// Import settings
import { settings }  from "$lib/settings"


// Define function to set auth cookies
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


// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    // MARK: Login
    login: async ({ request, cookies, locals }) => {
        // If client is logged in
        if (locals.user) {
            // End action
            return {
                status: 401
            }
        }


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // Do not validate form inputs as existing credentials may not conform to current validation checks
        // However these users should still be able to log in


        // Get password hash of `User` entry to be logged into
        try {
            let dbResponse = await prismaClient.User.findFirst({
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

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var { password, ...user } = dbResponse
            }
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error while fetching User entry from db using form-submitted email address",
                arguments: {
                    action: "login",
                    emailAddress: formData.email
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't log you in, try again later..."
            }
        }

        
        // If `User` entry with matching credentials does not exist, null will be returned
        // in which case instead of verifying `User.password.hash` a hashed empty string is used,
        // therefore `correctPassword` will always be false
        const hashedPassword = password?.hash || failHash

        // This is done because returning immediately allows malicious clients to figure out
        // valid usernames from response times, allowing them to only focus on guessing passwords 
        // in brute-force attacks. As a preventive measure, verify passwords even for non-existing users  
        const correctPassword = await stringHasher.verify(hashedPassword, formData.password)

        // If password is incorrect
        if (!correctPassword) {
            // End action
            return {
                status: 401,
                errors: {
                    email: "Email or password incorrect",
                    password: "Email or password incorrect"
                }
            }
        }


        // Create date set number of days from now to control when sessions expire
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + settings.session.duration)

        // Create `Session` entry connected to a `User` in db
        try {
            let dbResponse = await prismaClient.User.update({
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

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var { sessions } = dbResponse
            } else {
                throw new Error()
            }
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js", 
                message: "Error while creating Session entry in db",
                arguments: {
                    action: "login",
                    userId: user.id
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't log you in, try again later..."
            }
        }


        // Set client's cookies
        await setAuthCookies(cookies, user.id, sessions.at(-1).id)

        // End action
        return {
            status: 200,
            notice: "Successfully logged in!"
        }
    },


    // MARK: Register
    register: async ({ request, cookies }) => {
        // Variables to hold error information
        let errors = {}


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // If `formData.username` does not fit username requirements
        if (!inputHandler.validate.username(formData.username)) {
            errors.username = "Invalid username"
        }
        // If `formData.email` does not fit email requirements
        if (!inputHandler.validate.email(formData.email)) {
            errors.email = "Invalid email"
        }
        // If `formData.password` does not fit password requirements
        if (!inputHandler.validate.password(formData.password)) {
            errors.password = "Invalid password"
        }

        // If form inputs have failed validation checks
        if (Object.keys(errors).length > 0) {
            // End action
            return {
                status: 422,
                errors
            }
        }

        // Sanitize username and email
        const sanitizedUsername = inputHandler.sanitize(formData.username)
        const sanitizedEmail = inputHandler.sanitize(formData.email.toLowerCase())


        // Get `User` entries with the same username or email from `formData`
        try {
            let dbResponse = await prismaClient.User.findMany({
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
                message: "Error while fetching User entries from db using form-submitted username and email address",
                arguments: {
                    action: "register",
                    username: formData.username,
                    emailAddress: formData.email
                },
                error
            })

            // End action
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


        // Create date set number of days from now to control when sessions expire
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + settings.session.duration)

        // Create `User` entry in db
        try {
            let dbResponse = await prismaClient.User.create({
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

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var { sessions, email, ...user } = dbResponse

                // Send email with link to verify email
                // inputHandler.desanitize(email.address)
                Emailer.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)
            } else {
                throw new Error()
            }

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error while creating User entry in db",
                arguments: {
                    action: "register",
                    username: formData.username,
                    emailAddress: formData.email
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't register your account, try again later..."
            }
        }


        // Set client's cookies
        await setAuthCookies(cookies, user.id, sessions.at(-1).id)

        // End action
        return {
            status: 200,
            notice: "Successfully registered your account! Check your inbox for a email verification link"
        }
    },


    // MARK: Reset
    reset: async ({ request }) => {
        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // Do not validate email as existing email addresses may not conform to current validation checks
        // However these users should still be able to reset password

        // Sanitize email
        const sanitizedEmail = inputHandler.sanitize(formData.email.toLowerCase())


        // Get `User` entry to send password reset email
        try {
            let dbResponse = await prismaClient.User.findFirst({
                // Set field filters
                where: {
                    email: {
                        address: sanitizedEmail
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

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var { password, ...user } = dbResponse
            } else {
                // End action
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
                message: "Error while fetching User entry from db using form-submitted email address",
                arguments: {
                    action: "reset",
                    emailAddress: formData.email
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }


        // Get the time the last password reset code was sent
        const { codeSentAt } = password
        // If last link was sent less than set number of hours ago
        if (codeSentAt && codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.password.cooldown) > new Date()) {
            // End action
            return {
                status: 422,
                errors: { email: "Wait between requesting resets"}
            }
        }


        // Update `User` entry in db with new password reset code
        try {
            let dbResponse = await prismaClient.User.update({
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

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                let { email, password } = dbResponse

                // Send email with link to reset password
                // inputHandler.desanitize(email.address)
                Emailer.sendReset("finn.milner@outlook.com", user.id, password.resetCode)
            } else {
                throw new Error()
            }
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/login/+page.server.js",
                message: "Error updating User entry in db with new password reset code",
                arguments: {
                    action: "reset",
                    userId: user.id
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }


        // End action
        return {
            status: 200,
            notice: "Success! Check your inbox for a password reset link"
        }
    }
}