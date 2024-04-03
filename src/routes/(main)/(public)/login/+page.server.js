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
import { Argon2id as stringHasher } from "oslo/password"

// IMPROVE: Use named actions instead of default actions and added "mode"

// Define actions 
export const actions = {
    // Define default function to handle form submitions
    default: async ({ request, cookies }) => {
        // Get mode and other formData
        const { mode, ...formData } = Object.fromEntries(await request.formData())

        // Variable to hold error information for return statement
        let errors = {}

        // Define function to return error data to page
        const formHasErrors = () => {
            if (Object.keys(errors).length > 0) {
                return true
            }
        }

        // Sanitize username input
        if ( mode === "register" && !sanitizer.username(formData.username)) {
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

        // Return errors if any 
        if (formHasErrors()) {
            return {
                status: 422,
                errors
            }
        }


        // Login or register user based on what form they submited
        if (mode === "login") {
            // TODO: Login throttling

            // Check database for user with matching credentials
            try {
                var user = await prismaClient.User.findUnique({
                    where: {
                       email: formData.email.toLowerCase()
                    }
                })
            } catch (err) {
                console.log(err)
                return {
                    status: 500,
                    errors: {server: "Unable to login user"}
                }
            }
            // If user with matching credentials does not exist, null will be returned
            // in which case instead of checking "user.hashedPassword" an empty string is used,
            // therefore "validPassword" will always be false

            // Returning immediately allows malicious users to figure out valid usernames from response times,
			// allowing them to only focus on guessing passwords in brute-force attacks.
			// As a preventive measure, hash passwords even for invalid users           

            // Check if password is correct
            try {
                var validPassword = await new stringHasher().verify(user ? user.hashedPassword : "", formData.password)
            } catch {
                validPassword = false
            }

            // if password incorrect
            if (!validPassword) {
                errors.email = "Email or password incrorrect"
                errors.password = "Email or password incrorrect"
            }

            // Return errors if any 
            if (formHasErrors()) {
                return {
                    status: 403,
                    errors
                }
            }

            // Create new expiry date 21 days from now
            const expireyDate = new Date()
            expireyDate.setDate(expireyDate.getDate() +21)

            // Create new session
            try {
                // Get the ids of the user's sessions
                const dbResponse = await prismaClient.User.update({
                    // Set conditions
                    where: {
                        id: user.id
                    },
                    data: {
                        // Create new session linked to user
                        sessions: {
                            create: {
                                // Set the expires at field
                                expiresAt: expireyDate
                            }
                        }
                    },
                    // Set which feilds to retrieve from db
                    select: {
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
            } catch (err) {
                console.log(err)
                return {
                    status: 500,
                    errors: {server: "Unable to login user"}
                }
            }

            // Create cookie so login persists refreshes
            cookies.set("session", session.id, {
                path: ".",
                maxAge: 100 * 24 * 60 * 60,    // 100 days
                sameSite: "strict",
                secure: false
            })

            return {
                status: 200,
                errors
            }
        }


        else if (mode === "register") {

            // Check database for users with matching values unique feilds
            const existingUsers = await prismaClient.User.findMany({
                where: {
                    OR: [
                        {
                            username: formData.username
                        },
                        {
                            email: formData.email.toLowerCase()
                        }
                    ]
                },
                select: {
                    username: true,
                    email: true
                }
            })

            // Set errors if values match
            for (const user of existingUsers) {
                if (user.username === formData.username) {
                    errors.username = "Username taken"
                }
                if (user.email === formData.email.toLowerCase()) {
                    errors.email = "Email taken"
                }
            }

            // Return errors if any
            if (formHasErrors()) {
                return {
                    status: 409,
                    errors
                }
            }

            // Create new expiry date 21 days from now
            const expireyDate = new Date()
            expireyDate.setDate(expireyDate.getDate() +21)

            // Create new user and session
            try {
                // Get the ids of the user's sessions
                const dbResponse = await prismaClient.User.create({
                    // Set user fields
                    data: {
                        username: formData.username,
                        email: formData.email.toLowerCase(),
                        hashedPassword: await new stringHasher().hash(formData.password),
                        // Create new session linked to user
                        sessions: {
                            create: {
                                // Set the expires at field
                                expiresAt: expireyDate
                            }
                        }
                    },
                    // Set which feilds to retrieve from db
                    select: {
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
            } catch (err) {
                console.log(err)
                return {
                    status: 500,
                    errors: {server: "Unable to login user"}
                }
            }

            // Create cookie so login persists refreshes
            cookies.set("session", session.id, {
                path: ".",
                maxAge: 100 * 24 * 60 * 60,    // 100 days
                sameSite: "strict",
                secure: false
            })

            // TODO: Redirect home and add notice to verify email

            return {
                status: 200,
                errors
            }
        }
    }
}