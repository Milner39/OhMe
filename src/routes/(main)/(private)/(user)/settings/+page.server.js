import { client as prismaClient } from "$lib/server/prisma"
import { inputHandler } from "$lib/server/inputHandler.js"
import { stringHasher } from "$lib/server/hashUtils"
import { Emailer } from "$lib/server/emailUtils"
import { logError } from "$lib/server/errorLogger"


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

        // If `user` is `undefined`
        if (!user) {
            // End action
            return {
                status: 401
            }
        }


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // If `formData.username` does not fit username requirements
        if (!inputHandler.validate.username(formData.username)) {
            // End action
            return {
                status: 422,
                errors: { username: "Invalid username" }
            }
        }

        // Sanitize username
        const sanitizedUsername = inputHandler.sanitize(formData.username)

        // If username has not changed
        if (user.username === sanitizedUsername) {
            // End action
            return {
                status: 200
            }
        }


        // Update `User.username` in db for current user
        try {
            await prismaClient.User.update({
                // Set field filters
                where: {
                    id:  user.id
                },
                // Set field data
                data: {
                    username: sanitizedUsername
                }
            })

        // Catch errors
        } catch (error) {
            // Match error code
            switch (error.code) {
                // Code for prisma unique constraint failing
                case "P2002":
                    errors.username = "Username taken"
                    break

                default:
                    // Log error details
                    logError({
                        filepath: "src/routes/(main)/(private)/(user)/settings/+page.server.js",
                        message: "Error while updating username for User entry in db",
                        arguments: {
                            username: formData.username
                        },
                        error
                    })

                    notice = "We couldn't update your username, try again later..."
            }

            // End action
            return {
                status: 503,
                errors,
                notice
            }
        }


        // End action
        return {
            status: 200,
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

        // If `user` is `undefined`
        if (!user) {
            // End action
            return {
                status: 401
            }
        }


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // If `formData.email` does not fit email requirements
        if (!inputHandler.validate.email(formData.email)) {
            // End action
            return {
                status: 422,
                errors: { email: "Invalid email" }
            }
        }

        // Sanitize email
        const sanitizedEmail = inputHandler.sanitize(formData.email.toLowerCase())

        // If email has not changed
        if (user.email.address === sanitizedEmail) {
            // End action
            return {
                status: 200
            }
        }


        // Update `User.email.address` in db for current user
        try {
            let dbResponse = await prismaClient.User.update({
                // Set field filters
                where: {
                    id:  user.id
                },
                // Set field data
                data: {
                    email: {
                        update: {
                            address: sanitizedEmail,
                            verified: false,
                            verifyCode: crypto.randomUUID(),
                            codeSentAt: new Date()
                        }
                    }
                },
                // Set fields to return
                select: {
                    email: {
                        select: {
                            address: true,
                            verifyCode: true
                        }
                    }
                }
            })
            
            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                let { email } = dbResponse

                // Send email with link to verify updated email
                // inputHandler.desanitize(email.address) replaces my email
                Emailer.sendVerification("finn.milner@outlook.com", user.id, email.verifyCode)
            } else {
                throw new Error()
            }
        
        // Catch errors
        } catch (error) {
            // Match error code
            switch (error.code) {
                // Code for prisma unique constraint failing
                case "P2002":
                    errors.email = "Email taken"
                    break

                default:
                    // Log error details
                    logError({
                        filepath: "src/routes/(main)/(private)/(user)/settings/+page.server.js",
                        message: "Error while updating email address for User entry in db",
                        arguments: {
                            emailAddress: formData.email
                        },
                        error
                    })

                    notice = "We couldn't update your email address, try again later..."
            }

            // End action
            return {
                status: 503,
                errors,
                notice
            }
        }


        // End action
        return {
            status: 200,
            notice: "Successfully updated your email address!"
        }
    },


    // MARK: Password
    password: async ({ request, locals }) => {
        // Get `user` object from locals
        const { user } = locals

        // If `user` is `undefined`
        if (!user) {
            // End action
            return {
                status: 401
            }
        }


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())
        
        // Do not validate original password as existing passwords may not conform to current validation checks
        // However these passwords should still be able to be changed

        // If `formData.newPassword` does not fit password requirements
        if (!inputHandler.validate.password(formData.newPassword)) {
            // End action
            return {
                status: 422,
                errors: { newPassword: "Invalid password" }
            }
        }


        // Check if password is correct
        const correctPassword = await stringHasher.verify(user.password.hash, formData.password)

        // If password is incorrect
        if (!correctPassword) {
            // End action
            return {
                status: 422,
                errors: { password: "Password incorrect" }
            }
        }


        // Check `formData.password` is different from `formData.newPassword`
        if (formData.password === formData.newPassword) {
            return {
                status: 422,
                errors: {
                    password: "Must not match",
                    newPassword: "Must not match"
                }
            }
        }


        // Update `User.password.hash` in db for current user
        try {
            await prismaClient.User.update({
                // Set field filters
                where: {
                    id: user.id
                },
                // Set field data
                data: {
                    password: {
                        update: {
                            hash: await stringHasher.hash(formData.newPassword)
                        }
                    }
                }
            })

        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(private)/(user)/settings/+page.server.js",
                message: "Error while updating password hash for User entry in db",
                arguments: {
                    passwordHash: await stringHasher.hash(formData.newPassword)
                },
                error
            })

            // End action
            return {
                status: 503,
                notice: "We couldn't update your password, try again later..."
            }
        }


        // End action
        return {
            status: 200,
            notice: "Successfully updated your password!"
        }
    }
}