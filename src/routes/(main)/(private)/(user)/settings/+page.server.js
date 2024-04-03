// Import sanitizer to ensure all user inputs are valid
import { sanitizer } from "$lib/server/sanitize.js"
// Import the prisma client to interact with database
import { client as prismaClient } from "$lib/server/prisma"
// Import a hashing function to hash & unhash strings
import { stringHasher } from "$lib/server/argon"

// Define function to check if errors have been caught
const formHasErrors = (obj) => {
    if (Object.keys(obj).length > 0) {
        return true
    }
}

// Define actions
export const actions = {
    username: async ({ request, locals }) => {
        // Variable to hold error information
        let errors = {}
        
        // Get user from locals
        const { user } = locals

        // If no user
        if (!user) {
            return {
                status: 403,
                errors: {server: "User not signed in"}
            }
        }

        // Get form data
        const formData = Object.fromEntries(await request.formData())
        
        // Sanitize client input
        if (!sanitizer.username(formData.username)) {
            errors.username = "Invalid username"
        }

        // Return if inputs not valid
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
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
                default:
                    errors.server = "Unable to change information"
            }
        }

        // Return if entry cannot be updated
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors
        }
    },

    email: async ({ request, locals }) => {
        // Variable to hold error information
        let errors = {}

        // Get user from locals
        const { user } = locals

        // If no user
        if (!user) {
            return {
                status: 403,
                errors: {server: "User not signed in"}
            }
        }

        // Get form data
        const formData = Object.fromEntries(await request.formData())
        
        // Sanitize client input
        if (!sanitizer.email(formData.email)) {
            errors.email = "Invalid email"
        }

        // Return if inputs not valid
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
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
                    email: formData.email.toLowerCase(),
                    emailVerified: false
                }
            })
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                case "P2002":
                    errors.email = "Email taken"
                default:
                    errors.server = "Unable to change information"
            }
        }

        // Return if entry cannot be updated
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors
        }
    },

    password: async ({ request, locals }) => {
        // Variable to hold error information
        let errors = {}
        
        // Get user from locals
        const { user } = locals

        // If no user
        if (!user) {
            return {
                status: 403,
                errors: {server: "User not signed in"}
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
                errors
            }
        }

        // Get hashedPassword of User entry to be updated
        try {
            var response = await prismaClient.User.findUnique({
                // Set filter feilds
                where: {
                    id: user.id
                },
                // Set return feilds
                select: {
                    hashedPassword: true
                }
            })
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                default:
                    errors.server = "Unable to change information"
            }
        }

        // Return if entry cannot be updated
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
            }
        }

        // Check if hashedPassword matches password input by client
        try {
            var correctPassword = await stringHasher.verify(response.hashedPassword, formData.password)
        } catch {
            correctPassword = false
        }

        if (!correctPassword) {
            errors.password = "Password incorrect"
        }

        // Return if password is incorrect
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
            }
        }

        if (formData.password === formData.newPassword) {
            errors.newPassword = "Passwords are the same"
        }

        // Return if passwords are the same
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
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
                    // Re-hash password
                    hashedPassword: await stringHasher.hash(formData.newPassword)
                }
            })
        } catch (err) {
            // Catch error, match error code to
            // appropriate error message
            switch (err.code) {
                default:
                    errors.server = "Unable to change information"
            }
        }

        // Return if entry cannot be updated
        if (formHasErrors(errors)) {
            return {
                status: 422,
                errors
            }
        }

        // Return if no errors
        return {
            status: 200,
            errors
        }
    }
}