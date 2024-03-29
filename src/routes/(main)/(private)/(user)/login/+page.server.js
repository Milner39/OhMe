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

// Import the prisma client to interact with database
import { client as prismaClient } from "$lib/server/prisma"
import { Argon2id as stringHasher } from "oslo/password"
import { client as luciaClient } from "$lib/server/lucia"

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

        // IMPROVE: Use switch case statement to check for more specific error messages
        // Example: case email.length > 50 { error.email = "Email too long"}
        // If no cases are hit, no errors

        // Sanitize email input
        if (
            typeof formData.email !== "string" ||
            formData.email.length > 50 ||
            ! /[A-Za-z0-9._%+-]+@[A-Za-z0-9._%+-]+[.][A-Za-z]{2,}$/.test(formData.email)
        ) {
            errors.email = "Invalid email"
        }

        // Sanitize password input
        if (
            typeof formData.password !== "string" ||
            formData.password.length > 50 ||
            ! /[A-Za-z0-9 !?%^&*_:;@#~,.=+-]{1,}/.test(formData.password)
        ) {
            errors.password = "Invalid password"
        }

        // Login or register user based on what form they submited
        if (mode === "login") {
            // Return errors if any 
            if (formHasErrors()) {
                return {
                    status: 422,
                    errors
                }
            }

            // TODO: handle logins

            console.log("login details: ")
            console.log(formData)
        }
        else if (mode === "register") {
            // Sanitize username input
            if (
                typeof formData.username !== "string" ||
                formData.username.length > 25 ||
                ! /[A-Za-z0-9 !?%^&*_:;@#~,.=+-]/.test(formData.username)
            ) {
                errors.username = "Invalid username"
            }

            // Check database for users with matching values unique feilds
            const existingUsers = await prismaClient.User.findMany({
                where: {
                    OR: [
                        {
                            username: formData.username
                        },
                        {
                            email: formData.email
                        }
                    ]
                }
            })

            // Set errors if values match
            for (const user of existingUsers) {
                if (user.username === formData.username) {
                    errors.username = "Username taken"
                }
                if (user.email === formData.email) {
                    errors.email = "Email taken"
                }
            }

            // Return errors if any
            if (formHasErrors()) {
                return {
                    status: 422,
                    errors
                }
            }

            // Try to create user and get userId
            let user
            try {
                user = await prismaClient.User.create({
                    data: {
                        username: formData.username,
                        email: formData.email,
                        hashedPassword: await new stringHasher().hash(formData.password)
                    }
                })
            // Return errors if user cannot be created
            } catch (err) {
                console.log(err)
                return {
                    status: 500,
                    errors: {server: "Unable to register user"}
                }
            }

            // Create and assign user a session cookie so login persists refreshes
            const session = await luciaClient.createSession(user.id, {id: crypto.randomUUID()})
            const sessionCookie = luciaClient.createSessionCookie(session.id)
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            })

            // TODO: Redirect home and add notice to verify email
        }
    }
}