// Import prisma client instance to modify db
import { client as prismaClient } from "$lib/server/prisma"

// Import settings
import { settings }  from "$lib/settings"

// UPDATE: Streaming promises do not work on safari
// This seems like a sveltekit issue: https://github.com/sveltejs/kit/issues/10315

// https://kit.svelte.dev/docs/load#page-data
// Define load function
export const load = async ({ url }) => {

    // https://kit.svelte.dev/docs/web-standards#url-apis
    // Get URL parameters
    const userId = url.searchParams.get("user")
    const verifyCode = url.searchParams.get("code")

    // https://kit.svelte.dev/docs/load#streaming-with-promises
    // Wrap main script in a function so it can be streamed as a promise
    const verify = async () => {
        ////////                                                                      ////////
        // Not needed, just showcases loading animation                                     //
        // Cannot include due to safari not supporting the current promise streaming method //
        // await new Promise(resolve => setTimeout(resolve, 2500))                          //
        ////////                                                                      ////////

        // Variables to hold error information
        let errors = {}

        // If url does not have both search params
        if (!userId || !verifyCode) {
            // Return appropriate response object
            return {
                status: 400,
                errors: { client: "Missing URL parameters" }
            }
        }

        // Get User entry to have email verified
        try {
            let dbResponse = await prismaClient.User.findUnique({
                // Set filter fields
                where: {
                    id: userId,
                    email: {
                        verifyCode: verifyCode
                    }
                },
                // Set return fields
                select: {
                    email: {
                        select: {
                            verified: true,
                            codeSentAt: true
                        }
                    }
                }
            })
            // If `dbResponse` is not undefined
            if (dbResponse) {
                // Get data from object
                var { email } = dbResponse
            }
        } catch (err) {
            // Catch errors
            switch (err.code) {
                // Match error code to appropriate error message
                default:
                    console.error("Error at verify/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to verify address"
                    break
            }
            // Return appropriate response object if User entry cannot be updated
            return {
                status: 503,
                errors,
            }
        }

        // If `email` is undefined
        if (!email) {
            // Return appropriate response object
            return {
                status: 422,
                errors: { client: "Invalid URL parameters" }
            }
        }

        // If email is already verified
        if (email.verified) {
            return {
                // Return appropriate response object
                status: 409,
                errors
            }
        }

        // Get the time the last email verify code was sent
        const { codeSentAt } = email
        
        // If last link was sent more than `email.duration` ago
        if (!codeSentAt || codeSentAt.setTime(codeSentAt.getTime() + 1000 * 60 * 60 * settings.email.duration) <= new Date()) {
            // Return appropriate response object
            return {
                status: 401,
                errors: { client: "Verification code expired" }
            }
        }

        // Update user entry in db
        try {
            await prismaClient.User.update({
                // Set filter fields
                where: {
                    id: userId,
                },
                // Set update fields
                data: {
                    email: {
                        update: {
                            verified: true,
                            verifyCode: null,
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
                    console.error("Error at verify/+page.server.js")
                    console.error(err)
                    errors.server = "Unable to verify address"
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

    return {
        streamed: verify()
    }
}