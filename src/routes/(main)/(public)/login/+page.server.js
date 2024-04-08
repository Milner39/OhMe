// Define load function
export const load = async ({ url }) => {
    // Get URL parameter
    const mode = url.searchParams.get("mode")

    // If "?mode=..." is either login or mode, pass data to page
    // This will control which form is shown
    if (mode === "login" || mode === "register") {
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
            // If User with matching credentials does not exist, null will be returned
            // in which case instead of verifing "User.hashedPassword" a hashed empty string is used,
            // therefore "validPassword" will always be false
            var hashedPassword = dbResponse ? 
            dbResponse.password.hash : 
            failHash
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

        // Returning immediately allows malicious clients to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, verifiy passwords even for non-existing Users  
        const correctPassword = await stringHasher.verify(hashedPassword, formData.password)

        // Return if password incorrect
        if (!correctPassword) {
            return {
                status: 403,
                errors: {
                    email: "Email or password incrorrect",
                    password: "Email or password incrorrect"
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
            // Get the id of the newest session
            // which appears last in the array of sessions
            var session = dbResponse.sessions.at(-1)
            var userId = dbResponse.id
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
        await cookies.set("session", session.id, {
            path: "/",
            maxAge: 100 * 24 * 60 * 60,    // 100 days
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })
        await cookies.set("user", userId, {
            path: "/",
            maxAge: 100 * 24 * 60 * 60,    // 100 days
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
                            verifyLink: true
                        }
                    },
                    sessions: {
                        select: {
                            id: true
                        }
                    }
                }
            })
            // Send verification email
            mail.sendVerification("finn.milner@outlook.com", dbResponse.email.verifyLink)
            // Get the id of the newest session
            // which appears last in the array of sessions
            var session = dbResponse.sessions.at(-1)
            var userId = dbResponse.id
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
        await cookies.set("session", session.id, {
            path: "/",
            maxAge: 100 * 24 * 60 * 60,    // 100 days
            httpOnly: true,
            sameSite: "strict",
            secure: false
        })
        await cookies.set("user", userId, {
            path: "/",
            maxAge: 100 * 24 * 60 * 60,    // 100 days
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
    }
}