// https://kit.svelte.dev/docs/load#page-data
// Define load function
// MARK: Load
export const load = async ({ url }) => {
    // https://kit.svelte.dev/docs/web-standards#url-apis
    // Get URL parameter
    let mode = url.searchParams.get("mode")

    // Define the options for the different forms
    const options = ["login", "register", "reset"]

    // Check that the `mode` URL param is one of the items in `options`
    mode = options.includes(mode) ? mode : "login"

    // Return `mode`
    return { mode }
}

// Import sanitizer to ensure all user inputs are valid
import { sanitizer } from "$lib/server/sanitize.js"

// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// Import hashing functions to hash & verify hashes
import { stringHasher, failHash } from "$lib/server/argon"

// Import mailer to send emails
import { mail } from "$lib/server/mailer"

// Import settings
import { settings }  from "$lib/settings"

// Define function to check if errors have been caught
const formHasErrors = (obj) => {
    if (Object.keys(obj).length > 0) {
        return true
    }
}

// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    // MARK: Login
    login: async ({ request, cookies }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // If `formData.email` does not fit email requirements
        if (!sanitizer.email(formData.email)) {
            errors.email = "Invalid email"
        }

        // If `formData.password` does not fit password requirements
        if (!sanitizer.password(formData.password)) {
            errors.password = "Invalid password"
        }

        // If form inputs have failed sanitization checks
        if (formHasErrors(errors)) {
            // Return appropriate response object
            return {
                status: 422,
                errors,
                notice
            }
        }

        // Get User entry to be logged into
        try {
            let dbResponse = await prismaClient.User.findFirst({
                // Set filter feilds
                where: {
                    email: {
                        address: formData.email.toLowerCase()
                    }
                },
                // Set return feilds
                select: {
                    id: true,
                    password: {
                        select: {
                            hash: true
                        }
                    }
                }
            })
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get data from object
                var { password, ...user } = dbResponse
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at login/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to login client"
                    break
            }
            // Return appropriate response object if User entry cannot be fetched
            return {
                status: 503,
                errors,
                notice: "We couldn't log you in, try again later..."
            }
        }
        // If User entry with matching credentials does not exist, null will be returned
        // in which case instead of verifing `User.hashedPassword` a hashed empty string is used,
        // therefore "validPassword" will always be false
        const hashedPassword = password?.hash || failHash

        // This is done becasue returning immediately allows malicious users to figure out
        // valid usernames from response times, allowing them to only focus on guessing passwords 
        // in brute-force attacks. As a preventive measure, verifiy passwords even for non-existing users  
        const correctPassword = await stringHasher.verify(hashedPassword, formData.password)

        // If password is incorrect
        if (!correctPassword) {
            // Return appropriate response object
            return {
                status: 401,
                errors: {
                    email: "Email or password incorrect",
                    password: "Email or password incorrect"
                },
                notice
            }
        }

        // Create date `session.duration` days from now
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + settings.session.duration)

        // Update User entry in db
        try {
            let dbResponse = await prismaClient.User.update({
                // Set filter feilds
                where: {
                    id: user.id
                },
                // Set update feilds
                data: {
                    sessions: {
                        create: {
                            expiresAt: expiryDate
                        }
                    }
                },
                // Set return feilds
                select: {
                    sessions: {
                        select: {
                            id: true
                        }
                    }
                }
            })
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get data from object
                var { sessions } = dbResponse
            } else {
                throw new Exception()
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at login/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to login user"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
                notice: "We couldn't log you in, try again later..."
            }
        }

        // Set cookies in client's browser so login persists refreshes
        await cookies.set("session", sessions.at(-1).id, {
            path: "/",
            maxAge: 1000000000,
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })
        await cookies.set("user", user.id, {
            path: "/",
            maxAge: 1000000000,  
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully logged in!"
        }
    },
    // MARK: Register
    register: async ({ request, cookies }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // If `formData.username` does not fit username requirements
        if (!sanitizer.username(formData.username)) {
            errors.username = "Invalid username"
        }

        // If `formData.email` does not fit email requirements
        if (!sanitizer.email(formData.email)) {
            errors.email = "Invalid email"
        }

        // If `formData.password` does not fit password requirements
        if (!sanitizer.password(formData.password)) {
            errors.password = "Invalid password"
        }

        // If form inputs have failed sanitization checks
        if (formHasErrors(errors)) {
            // Return appropriate response object
            return {
                status: 422,
                errors,
                notice
            }
        }

        // Get User entries with the same username or email from `formData`
        try {
            let dbResponse = await prismaClient.User.findMany({
                // Set filter feilds
                where: {
                    OR: [
                        {
                            username: formData.username
                        },
                        {
                            email: {
                                address: formData.email.toLowerCase()
                            }
                        }
                    ]
                },
                // Set return feilds
                select: {
                    username: true,
                    email: {
                        select: {
                            address: true
                        }
                    }
                }
            })
            // Check if username or email taken
            for (const user of dbResponse) {
                if (user.username === formData.username) {
                    errors.username = "Username taken"
                }
                if (user.email.address === formData.email) {
                    errors.email = "Email taken"
                }
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at login/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to register user"
                    break
            }
            // Return appropriate response object if User entries cannot be fetched
            return {
                status: 503,
                errors,
                notice: "We couldn't register your account, try again later..."
            }
        }

        // Return appropriate response object if username or email is taken
        if (formHasErrors(errors)) {
            return {
                status: 409,
                errors,
                notice
            }
        }

        // Create date `session.duration` days from now
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + settings.session.duration)

        // Create User entry in db
        try {
            let dbResponse = await prismaClient.User.create({
                // Set data feilds
                data: {
                    username: formData.username,
                    email: {
                        create: {
                            address: formData.email.toLowerCase(),
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
                // Set return feilds
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
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get data from object
                var { sessions, email, ...user } = dbResponse
                // Send email with link to verify email
                mail.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)
            } else {
                throw new Exception()
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at login/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to register user"
                    break
            }
            // Return appropriate response object if User entry cannot be created
            return {
                status: 503,
                errors,
                notice: "We couldn't register your account, try again later..."
            }
        }

        // Set cookies in client's browser so login persists refreshes
        await cookies.set("session", sessions.at(-1).id, {
            path: "/",
            maxAge: 1000000000, 
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })
        await cookies.set("user", user.id, {
            path: "/",
            maxAge: 1000000000,  
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully registered your account! Check your inbox for a email verification link"
        }
    },
    // MARK: Reset
    reset: async ({ request }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // If `formData.email` does not fit email requirements
        if (!sanitizer.email(formData.email)) {
            // Return appropriate response object
            return {
                status: 422,
                errors: {email: "Invalid email"},
                notice
            }
        }

        // Get User entry to send password reset email
        try {
            let dbResponse = await prismaClient.User.findFirst({
                // Set filter feilds
                where: {
                    email: {
                        address: formData.email.toLowerCase()
                    }
                },
                // Set return feilds
                select: {
                    id: true,
                    password: {
                        select: {
                            codeSentAt: true
                        }
                    }
                }
            })
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get `password` object
                var { password, ...user } = dbResponse
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at login/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to send password reset link"
                    break
            }
            // Return appropriate response object if User entry cannot be fetched
            return {
                status: 503,
                errors,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }

        // If `user` is undefined
        if (!user) {
            // Return appropriate response object
            return {
                status: 401,
                errors: { email: "Email incorrect" },
                notice
            }
        }

        // Get the time the last password reset code was sent
        const { codeSentAt } = password
        // If last link was sent less than `password.cooldown` ago
        if (codeSentAt && codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.password.cooldown) > new Date()) {
            // Return appropriate response object
            return {
                status: 422,
                errors: { email: "Wait between requesting resets"},
                notice
            }
        }

        // Update User entry in db
        try {
            let dbResponse = await prismaClient.User.update({
                // Set filter feilds
                where: {
                    id: user.id
                },
                // Set update feilds
                data: {
                    password: {
                        update: {
                            resetCode: crypto.randomUUID(),
                            codeSentAt: new Date()
                        }
                    }
                },
                // Set return feilds
                select: {
                    password: {
                        select: {
                            resetCode: true
                        }
                    }
                }
            })
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get `password` and `user` object
                let { password } = dbResponse
                // Send email with link to reset password
                mail.sendReset("finn.milner@outlook.com", user.id, password.resetCode)
            } else {
                throw new Exception()
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at login/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to send password reset link"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
                notice: "We couldn't email you a password reset link, try again later..."
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Success! Check your inbox for a password reset link"
        }
    }
}