// Import sanitizer to ensure all user inputs are valid
import { sanitizer } from "$lib/server/sanitize.js"

// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// Import hashing functions to hash & verify hashes
import { stringHasher, failHash } from "$lib/server/argon"

// Import mailer to send emails
import { mail } from "$lib/server/mailer"

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
    username: async ({ request, locals }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice
        
        // Get `user` object from locals
        const { user } = locals

        // If `user` is undefined
        if (!user) {
            // Return appropriate response object
            return {
                status: 403,
                errors: {server: "Client not logged in"},
                notice: "Login to access that page"
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // Check `formData.username` fits username requirements
        if (!sanitizer.username(formData.username)) {
            // Return appropriate response object
            return {
                status: 422,
                errors: {username: "Invalid username"},
                notice
            }
        }

        // Check `formData.username` is different from current username
        if (user.username === formData.username) {
            // Return appropriate response object
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
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
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
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
                notice
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully updated your username!"
        }
    },

    email: async ({ request, locals }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice

        // Get `user` object from locals
        const { user } = locals

        // If `user` is undefined
        if (!user) {
            // Return appropriate response object
            return {
                status: 403,
                errors: {server: "Client not logged in"},
                notice: "Login to access that page"
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // Check `formData.email` fits email requirements
        if (!sanitizer.email(formData.email)) {
            // Return appropriate response object
            return {
                status: 422,
                errors: {email: "Invalid email"},
                notice
            }
        }

        // Check `formData.email` is different from current email
        if (user.email.address === formData.email) {
            // Return appropriate response object
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
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get `email` object
                let { email } = dbResponse
                // Send email with link to verify updated email
                mail.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
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
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
                notice
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully updated your email address!"
        }
    },

    password: async ({ request, locals }) => {
        // Variables to hold error information and set notice message
        let errors = {}
        let notice

        // Get `user` object from locals
        const { user } = locals

        // If `user` is undefined
        if (!user) {
            // Return appropriate response object
            return {
                status: 403,
                errors: {server: "Client not logged in"},
                notice: "Login to access that page"
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // Check `formData.password` and `formData.newPassword` fits password requirements
        if (!sanitizer.password(formData.password)) {
            errors.password = "Invalid password"
        }
        if (!sanitizer.password(formData.newPassword)) {
            errors.newPassword = "Invalid password"
        }

        // Check if form inputs have failed sanitization checks
        if (formHasErrors(errors)) {
            // Return appropriate response object
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
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get `password` object
                var { password } = dbResponse
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at settings.server.js")
                    console.error(err)
                    errors.server = "Unable to change information"
                    break
            }
            // Return appropriate response object if hashed password of User entry cannot be fetched
            return {
                status: 503,
                errors,
                notice: "We couldn't update your password, try again later..."
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

        // Check if password is correct
        if (!correctPassword) {
            // Return appropriate response object
            return {
                status: 422,
                errors: {password: "Password incorrect"},
                notice
            }
        }

        // Check `formData.password` is different from `formData.newPassword`
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
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at settings.server.js")
                    console.error(err)
                    errors.server = "Unable to change information"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
                notice: "We couldn't update your username, try again later..."
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors,
            notice: "Successfully updated your password!"
        }
    }
}