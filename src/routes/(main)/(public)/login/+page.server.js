// Define load function
export const load = async ({ url }) => {
    // Get URL parameter
    const mode = url.searchParams.get("mode")

    // If "?mode=..." is either login or mode, pass data to page
    // This will control which form is shown
    if (mode === "login" || mode === "register" || mode === "recover") {
        return {mode}
    }
}

// Import sanitizer to ensure all user inputs are safe
import { sanitizer } from "$lib/server/sanitize.js"
// Import the prisma client to interact with database
import { client as prismaClient } from "$lib/server/prisma"
// Import a hashing function to store hashed passwords in database
// and to unhash stored values to validate password user input
import { stringHasher, failHash } from "$lib/server/argon"
// Import mail to handle verification codes and send emails
import { mail } from "$lib/server/mailer"

// Define function to check if errors have been caught
const formHasErrors = (obj) => {
    if (Object.keys(obj).length > 0) {
        return true
    }
}

// Define actions 
export const actions = {
    login: async ({ request, cookies }) => {
        // Variable to hold error information
        let errors = {}
        let notice

        // Get form data
        const formData = Object.fromEntries(await request.formData())

        // Sanitize email input
        if (!sanitizer.email(formData.email)) {
            errors.email = "Invalid email"
        }

        // Sanitize password input
        if (!sanitizer.password(formData.password)) {
            errors.password = "Invalid password"
        }

        // Return if inputs not valid
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors,
                notice
            }
        }

        // Get hashed password of User entry to be logged into
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set filter feilds
                where: {
                    emailAddress: formData.email.toLowerCase()
                },
                // Set return feilds
                select: {
                    password: {
                        select: {
                            hash: true
                        }
                    }
                }
            })
            if (dbResponse) {
                var { password } = dbResponse
            }
        } catch (err) {
            switch (err.code) {
                default:
                    console.error("Error at login.server.js")
                    console.error(err)
                    errors.server = "Unable to login client"
                    break
            }
            // Return if cannot get hashed password
            return {
                status: 503,
                errors,
                notice: "We couldn't log you in, try again later..."
            }
        }
        // If user with matching credentials does not exist, null will be returned
        // in which case instead of verifing "User.hashedPassword" a hashed empty string is used,
        // therefore "validPassword" will always be false
        const hashedPassword = password?.hash || failHash

        // Returning immediately allows malicious clients to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, verifiy passwords even for non-existing Users  
        const correctPassword = await stringHasher.verify(hashedPassword, formData.password)

        // Return if password incorrect
        if (!correctPassword) {
            return {
                status: 403,
                errors: {
                    email: "Email or password incorrect",
                    password: "Email or password incorrect"
                },
                notice
            }
        }

        // Create date 21 days from now
        const expireyDate = new Date()
        expireyDate.setDate(expireyDate.getDate() +21)

        // Create Session entry in db, linked to User entry
        try {
            let dbResponse = await prismaClient.User.update({
                // Set filter feilds
                where: {
                    emailAddress: formData.email.toLowerCase()
                },
                // Set update feilds
                data: {
                    sessions: {
                        create: {
                            expiresAt: expireyDate
                        }
                    }
                },
                // Set return feilds
                select: {
                    id: true,
                    sessions: {
                        select: {
                            id: true
                        }
                    }
                }
            })
            if (dbResponse) {
                var { sessions, ...user } = dbResponse
            }
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                default:
                    console.error("Error at login.server.js")
                    console.error(err)
                    errors.server = "Unable to login user"
                    break
            }
            // Return if session cannot be created
            return {
                status: 503,
                errors,
                notice: "We couldn't log you in, try again later..."
            }
        }

        // Create cookie so login persists refreshes
        await cookies.set("session", sessions.at(-1).id, {
            path: "/",
            maxAge: 50 * 24 * 60 * 60,    // 50 days
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })
        await cookies.set("user", user.id, {
            path: "/",
            maxAge: 50 * 24 * 60 * 60,    // 50 days
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })

        // Return if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully logged in!"
        }
    },

    register: async ({ request, cookies }) => {
        // Variable to hold error information
        let errors = {}
        let notice

        // Get form data
        const formData = Object.fromEntries(await request.formData())

        // Sanitize username input
        if (!sanitizer.username(formData.username)) {
            errors.username = "Invalid username"
        }

        // Sanitize email input
        if (!sanitizer.email(formData.email)) {
            errors.email = "Invalid email"
        }

        // Sanitize password input
        if (!sanitizer.password(formData.password)) {
            errors.password = "Invalid password"
        }

        // Return if inputs not valid
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors,
                notice
            }
        }

        // Check username or email is taken
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
            for (const user of dbResponse) {
                if (user.username === formData.username) {
                    errors.username = "Username taken"
                }
                if (user.email.address === formData.email) {
                    errors.email = "Email taken"
                }
            }
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                default:
                    console.error("Error at login.server.js")
                    console.error(err)
                    errors.server = "Unable to register user"
                    break
            }
            // Return if cannot get User entries
            return {
                status: 503,
                errors,
                notice: "We couldn't register your account, try again later..."
            }
        }

        // Return if username or email taken
        if (formHasErrors(errors)) {
            return {
                status: 409,
                errors,
                notice
            }
        }

        // Create date 21 days from now
        const expireyDate = new Date()
        expireyDate.setDate(expireyDate.getDate() +21)

        // Create User and Session entry in db
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
                            expiresAt: expireyDate
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
            if (dbResponse) {
                var { sessions, email, ...user } = dbResponse
                mail.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)
            }
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                default:
                    console.error("Error at login.server.js")
                    console.error(err)
                    errors.server = "Unable to register user"
                    break
            }
            // Return if user cannot be created
            return {
                status: 503,
                errors,
                notice: "We couldn't register your account, try again later..."
            }
        }

        // Create cookie so login persists refreshes
        await cookies.set("session", sessions.at(-1).id, {
            path: "/",
            maxAge: 50 * 24 * 60 * 60,    // 50 days
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })
        await cookies.set("user", user.id, {
            path: "/",
            maxAge: 50 * 24 * 60 * 60,    // 50 days
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })

        // Return if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully registered your account! Check your inbox for a verification link"
        }
    },

    recover: async ({ request }) => {
        // Variable to hold error information
        let errors = {}
        let notice
        
        // Get form data
        const formData = Object.fromEntries(await request.formData())

        // Sanitize email input
        if (!sanitizer.email(formData.email)) {
            errors.email = "Invalid email"
        }

        // Return if inputs not valid
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors,
                notice
            }
        }

        // Get User entry to be recovered
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set filter feilds
                where: {
                    emailAddress: formData.email.toLowerCase()
                },
                // Set return feilds
                select: {
                    password: {
                        select: {
                            codeSentAt: true
                        }
                    }
                }
            })
            if (dbResponse) {
                var { password } = dbResponse
            }
        } catch (err) {
            switch (err.code) {
                default:
                    console.error("Error at login.server.js")
                    console.error(err)
                    errors.server = "Unable to recover account"
                    break
            }
            // Return if cannot get hashed password
            return {
                status: 503,
                errors,
                notice: "We couldn't recover your account, try again later..."
            }
        }

        // Return if User entry does not exist
        if (!password) {
            return {
                status: 403,
                errors: { email: "Email incorrect" },
                notice
            }
        }

        const { codeSentAt } = password
        // If last link was sent less than an hour ago
        if (codeSentAt && codeSentAt.setTime(codeSentAt.getTime() + 1 * 60 * 60 * 1000) > new Date()) {
            return {
                status: 422,
                errors: { email: "Wait an hour between resets"},
                notice
            }
        }

        // Create password reset link
        try {
            let dbResponse = await prismaClient.User.update({
                // Set filter feilds
                where: {
                    emailAddress: formData.email.toLowerCase()
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
                    id: true,
                    password: {
                        select: {
                            resetCode: true
                        }
                    }
                }
            })
            if (dbResponse) {
                let { password, ...user} = dbResponse
                mail.sendRecovery("finn.milner@outlook.com", user.id, password.resetCode)
            }
        } catch (err) {
            switch (err.code) {
                default:
                    console.error("Error at login.server.js")
                    console.error(err)
                    errors.server = "Unable to recover account"
                    break
            }
            // Return if cannot get hashed password
            return {
                status: 503,
                errors,
                notice: "We couldn't recover your account, try again later..."
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully recovered your account! Check your inbox for a reset link"
        }
    }
}