// Import sanitizer to ensure all user inputs are valid
import { sanitizer } from "$lib/server/sanitize.js"

// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// Import hashing functions to hash & verify hashes
import { stringHasher } from "$lib/server/argon"

// UPDATE: Streaming promises do not work on safari
// This seems like a sveltekit issue: https://github.com/sveltejs/kit/issues/10315

// https://kit.svelte.dev/docs/load#page-data
// Define load function
export const load = async ({ url }) => {

    // https://kit.svelte.dev/docs/web-standards#url-apis
    // Get URL parameters
    const userId = url.searchParams.get("user")
    const resetCode = url.searchParams.get("code")

    // https://kit.svelte.dev/docs/load#streaming-with-promises
    // Wrap main script in a function so it can be streamed as a promise
    const checkCode = async () => {
        // Variables to hold error information and set notice message
        let errors = {}

        ////////                                                                      ////////
        // Not needed, just showcases loading animation                                     //
        // Cannot include due to safari not supporting the current promise streaming method //
        // await new Promise(resolve => setTimeout(resolve, 2500))                          //
        ////////                                                                      ////////

        // If url does not have both search params
        if (!userId || !resetCode) {
            // Return appropriate response object
            return {
                status: 400,
                errors: { client: "Missing URL parameters" }
            }
        }

        // Get User entry to have password reset
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set filter feilds
                where: {
                    id: userId,
                    password: {
                        resetCode: resetCode
                    }
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
                    console.error("Error at reset.server.js")
                    console.error(err)
                    errors.server = "Unable to check reset code"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
            }
        }

        // If `email` is undefined
        if (!password) {
            // Return appropriate response object
            return {
                status: 422,
                errors: { client: "Invalid URL parameters" }
            }
        }

        // Get the DateTime of when the last password reset code was sent
        const { codeSentAt } = password
        // If last link was sent more than an hour ago
        if (!codeSentAt || codeSentAt.setTime(codeSentAt.getTime() + 1 * 60 * 60 * 1000) <= new Date()) {
            // Return appropriate response object
            return {
                status: 401,
                errors: { client: "Reset code expired" }
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors: {}
        }
    }

    return {
        streamed: checkCode()
    }
}


// https://kit.svelte.dev/docs/form-actions
// "A +page.server.js file can export actions, which allow you to POST data to the server using the <form> element."
// Define actions
export const actions = {
    default: async ({ url, request }) => {
        // Variables to hold error information and set notice message
        let errors = {}

        // https://kit.svelte.dev/docs/web-standards#url-apis
        // Get URL parameters
        const userId = url.searchParams.get("user")
        const resetCode = url.searchParams.get("code")

        // If url does not have both search params
        if (!userId || !resetCode) {
            // Return appropriate response object
            return {
                status: 400,
                errors: { client: "Missing URL parameters" }
            }
        }

        // Get form data sent by client
        const formData = Object.fromEntries(await request.formData())

        // Check `formData.password` fits password requirements
        if (!sanitizer.password(formData.password)) {
            // Return appropriate response object
            return {
                status: 422,
                errors: { password: "Invalid password" }
            }
        }

        // Get DateTime one hour in the past to filter out expired codes
        const unexpired = new Date()
        unexpired.setTime(unexpired.getTime() - 1 * 60 * 60 * 1000)
        try {
            await prismaClient.User.update({
                // Set filter feilds
                where: {
                    id: userId,
                    password: {
                        resetCode: resetCode,
                        codeSentAt: {
                            gte: unexpired
                        }
                    }
                },
                // Set update feilds
                data: {
                    password: {
                        update: {
                            hash: await stringHasher.hash(formData.password),
                            resetCode: null,
                            codeSentAt: null
                        }
                    }
                }
            })
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at reset.server.js")
                    console.error(err)
                    errors.server = "Unable to reset password"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
            }
        }

        // Return appropriate response object if no errors
        return {
            status: 200,
            errors: {}
        }
    }
}