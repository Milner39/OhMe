// Import sanitizer to ensure all user inputs are valid
import { sanitizer } from "$lib/server/sanitize.js"
// Import the prisma client to interact with database
import { client as prismaClient } from "$lib/server/prisma"
// Import a hashing function to hash & unhash strings
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
    username: async ({ request, locals }) => {
        // Variables to hold error information
        let errors = {}
        let notice
        
        // Get user from locals
        const { user } = locals

        // If no user
        if (!user) {
            return {
                status: 403,
                errors: {server: "Client not logged in"},
                notice: "Login to access that page"
            }
        }

        // Get form data
        const formData = Object.fromEntries(await request.formData())
        
        // Sanitize client input
        if (!sanitizer.username(formData.username)) {
            return {
                status: 422,
                errors: {username: "Invalid username"},
                notice
            }
        }

        // Return if no change was made
        if (user.username === formData.username) {
            return {
                status: 200,
                errors,
                notice
            }
        }

        // Update User entry in db
        try {
            await prismaClient.User.update({
                // Set filter feilds
                where: {
                    id:  user.id
                },
                // Set update feilds
                data: {
                    username: formData.username
                }
            })
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                case "P2002":
                    errors.username = "Username taken"
                    break
                default:
                    console.error("Error at settings.server.js")
                    console.error(err)
                    errors.server = "Unable to change information"
                    notice = "We couldn't update your username, try again later..."
                    break
            }
            // Return if entry cannot be updated
            return {
                status: 503,
                errors,
                notice
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully updated your username!"
        }
    },

    email: async ({ request, locals }) => {
        // Variables to hold error information
        let errors = {}
        let notice

        // Get user from locals
        const { user } = locals

        // If no user
        if (!user) {
            return {
                status: 403,
                errors: {server: "Client not logged in"},
                notice: "Login to access that page"
            }
        }

        // Get form data
        const formData = Object.fromEntries(await request.formData())
        
        // Sanitize client input
        if (!sanitizer.email(formData.email)) {
            return {
                status: 422,
                errors: {email: "Invalid email"},
                notice
            }
        }

        // Return if no change was made
        if (user.email.address === formData.email) {
            return {
                status: 200,
                errors,
                notice
            }
        }

        // Update User entry in db
        try {
            let dbResponse = await prismaClient.User.update({
                // Set filter feilds
                where: {
                    id:  user.id
                },
                // Set update feilds
                data: {
                    email: {
                        update: {
                            address: formData.email.toLowerCase(),
                            verified: false,
                            verifyCode: crypto.randomUUID(),
                            codeSentAt: new Date()
                        }
                    }
                },
                // Set return feilds
                select: {
                    email: {
                        select: {
                            verifyCode: true
                        }
                    }
                }
            })
            if (dbResponse) {
                let { email } = dbResponse
                mail.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)
            }
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                case "P2002":
                    errors.email = "Email taken"
                    break
                default:
                    console.error("Error at settings.server.js")
                    console.error(err)
                    errors.server = "Unable to change information"
                    notice = "We couldn't update your email address, try again later..."
                    break
            }
            // Return if entry cannot be updated
            return {
                status: 503,
                errors,
                notice
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully updated your email address!"
        }
    },

    password: async ({ request, locals }) => {
        // Variable to hold error information
        let errors = {}
        let notice
        
        // Get user from locals
        const { user } = locals

        // If no user
        if (!user) {
            return {
                status: 403,
                errors: {server: "Client not logged in"},
                notice: "Login to access that page"
            }
        }

        // Get form data
        const formData = Object.fromEntries(await request.formData())
        
        // Sanitize client input
        if (!sanitizer.password(formData.password)) {
            errors.password = "Invalid password"
        }
        if (!sanitizer.password(formData.newPassword)) {
            errors.newPassword = "Invalid password"
        }

        // Return if inputs not valid
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors,
                notice
            }
        }

        // Get hashed password of User entry to be updated
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set filter feilds
                where: {
                    id: user.id
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
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                default:
                    console.error("Error at settings.server.js")
                    console.error(err)
                    errors.server = "Unable to change information"
                    break
            }
            // Return if cannot get hashed password
            return {
                status: 503,
                errors,
                notice: "We couldn't update your password, try again later..."
            }
        }
        // If user with matching credentials does not exist, null will be returned
        // in which case instead of verifing "User.hashedPassword" a hashed empty string is used,
        // therefore "validPassword" will always be false
        const hashedPassword = password?.hash || failHash

        // Returning immediately allows malicious users to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, verifiy passwords even for non-existing users  
        const correctPassword = await stringHasher.verify(hashedPassword, formData.password)

        // Return if password is incorrect
        if (!correctPassword) {
            return {
                status: 422,
                errors: {password: "Password incorrect"},
                notice
            }
        }

        // Return if no change was made
        if (formData.password === formData.newPassword) {
            return {
                status: 422,
                errors: {
                    password: "Passwords are the same",
                    newPassword: "Passwords are the same"
                },
                notice
            }
        }

        // Update User entry in db
        try {
            await prismaClient.User.update({
                // Set filter feilds
                where: {
                    id: user.id
                },
                // Set update feilds
                data: {
                    password: {
                        update: {
                            hash: await stringHasher.hash(formData.newPassword)
                        }
                    }
                }
            })
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                default:
                    console.error("Error at settings.server.js")
                    console.error(err)
                    errors.server = "Unable to change information"
                    break
            }
            // Return if entry cannot be updated
            return {
                status: 503,
                errors,
                notice: "We couldn't update your username, try again later..."
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully updated your password!"
        }
    }
}