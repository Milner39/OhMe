// Import prisma client instance to interact with db
import { client as prismaClient } from "$lib/server/prisma"

// Import inputHandler to make sure validate and sanitize inputs
import { inputHandler } from "$lib/server/inputHandler.js"

// Import hashing functions to hash & verify hashes
import { stringHasher } from "$lib/server/argon"

// Import error logger to record error details
import { logError } from "$lib/server/errorLogger"

// Import settings
import { settings }  from "$lib/settings"


// MARK: Load
// https://kit.svelte.dev/docs/load#page-data
// Define load function
export const load = async ({ url }) => {
    // https://kit.svelte.dev/docs/load#streaming-with-promises
    // Wrap main script in a function so it can be streamed as a promise
    const checkCode = async (url) => {
        // Get URL parameters
        const userId = url.searchParams.get("user")
        const resetCode = url.searchParams.get("code")


        // If url does not have both search params
        if (!userId || !resetCode) {
            // End function
            return {
                status: 400,
                errors: { client: "This is not a valid reset link..." }
            }
        }

        // If url params are not in valid format
        if (!inputHandler.validate.uuid(userId) || !inputHandler.validate.uuid(resetCode)) {
            // End function
            return {
                status: 400,
                errors: { client: "This is not a valid reset link..." }
            }
        }


        // Get `User` entry to have password reset
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set field filters
                where: {
                    id: userId,
                    password: {
                        resetCode: resetCode
                    }
                },
                // Set fields to return
                select: {
                    password: {
                        select: {
                            codeSentAt: true
                        }
                    }
                }
            })

            // If `dbResponse` is not `undefined`
            if (dbResponse) {
                var { password } = dbResponse
            } else {
                // End function
                return {
                    status: 422,
                    errors: { client: "Incorrect reset code..." }
                }
            }
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/reset/+page.server.js",
                message: "Error while fetching User entry from db using user id and reset code from url param",
                arguments: {
                    userId,
                    resetCode
                },
                error
            })

            // End function
            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..." }
            }
        }


        // Get the time the last password reset code was sent
        const { codeSentAt } = password
        // If last link was sent more than set number of hours ago
        if (!codeSentAt || codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.password.duration) < new Date()) {
            // End function
            return {
                status: 401,
                errors: { client: "Reset code expired..." }
            }
        }


        // End function
        return {
            status: 200
        }
    }


    // End load
    return {
        streamed: checkCode(url)
    }
}





// MARK: Action
// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    default: async ({ url, request }) => {
        // Get URL parameters
        const userId = url.searchParams.get("user")
        const resetCode = url.searchParams.get("code")

        // If url does not have both search params
        if (!userId || !resetCode) {
            // End action
            return {
                status: 400
            }
        }

        // If url params are not in valid format
        if (!inputHandler.validate.uuid(userId) || !inputHandler.validate.uuid(resetCode)) {
            // End action
            return {
                status: 400
            }
        }


        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // If `formData.password` does not fit password requirements
        if (!inputHandler.validate.password(formData.password)) {
            // End action
            return {
                status: 422,
                errors: { password: "Invalid password" }
            }
        }


        // Get time set number of hours in the past to filter out expired codes
        const unexpired = new Date()
        unexpired.setTime(unexpired.getTime() - 1000 * 60 * 60 * settings.password.duration)

        // Update `User` entry in db
        try {
            await prismaClient.User.update({
                // Set field filters
                where: {
                    id: userId,
                    password: {
                        resetCode: resetCode,
                        codeSentAt: {
                            gte: unexpired
                        }
                    }
                },
                // Set field data
                data: {
                    password: {
                        update: {
                            hash: await stringHasher.hash(formData.password),
                            resetCode: null,
                        }
                    }
                }
            })
        
        // Catch errors
        } catch (error) {
            // Log error details
            logError({
                filepath: "src/routes/(main)/(public)/reset/+page.server.js",
                message: "Error while updating password for User entry in db",
                arguments: {
                    userId,
                    resetCode
                },
                error
            })
            
            // End action
            return {
                status: 503,
                errors: { client: "Something went wrong, try again later..." }
            }
        }


        // End action
        return {
            status: 200
        }
    }
}