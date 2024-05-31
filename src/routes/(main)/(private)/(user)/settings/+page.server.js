// Import sanitizer to ensure all user inputs are valid
import { sanitizer } from "$lib/server/sanitize.js"

// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// Import hashing functions to hash & verify hashes
import { stringHasher } from "$lib/server/argon"

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
    // MARK: Username
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
                status: 401,
                errors: {server: "Client not logged in"},
                notice
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // If `formData.username` does not fit username requirements
        if (!sanitizer.username(formData.username)) {
            // Return appropriate response object
            return {
                status: 422,
                errors: {username: "Invalid username"},
                notice
            }
        }

        // If `formData.username` is current username
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
                // Set filter fields
                where: {
                    id:  user.id
                },
                // Set update fields
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
                    console.error("Error at settings/+page.server.js")
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
    // MARK: Email
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
                status: 401,
                errors: {server: "Client not logged in"},
                notice
            }
        }

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

        // If `formData.email` is current email
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
                // Set filter fields
                where: {
                    id:  user.id
                },
                // Set update fields
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
                // Set return fields
                select: {
                    email: {
                        select: {
                            address: true,
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
            } else {
                throw new Exception()
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                case "P2002":
                    errors.email = "Email taken"
                    break
                default:
                    console.error("Error at settings/+page.server.js")
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
    // MARK: Password
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
                status: 401,
                errors: {server: "Client not logged in"},
                notice
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // If `formData.password` / `formData.newPassword` do not fit password requirements
        if (!sanitizer.password(formData.password)) {
            errors.password = "Invalid password"
        }
        if (!sanitizer.password(formData.newPassword)) {
            errors.newPassword = "Invalid password"
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

        // Check if password is correct
        const correctPassword = await stringHasher.verify(user.password.hash, formData.password)

        // If password is incorrect
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
                    password: "Must not match",
                    newPassword: "Must not match"
                },
                notice
            }
        }

        // Update User entry in db
        try {
            await prismaClient.User.update({
                // Set filter fields
                where: {
                    id: user.id
                },
                // Set update fields
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
                    console.error("Error at settings/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to change information"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
                notice: "We couldn't update your password, try again later..."
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