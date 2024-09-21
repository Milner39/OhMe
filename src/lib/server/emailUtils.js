// #region Imports

/* 
    https://nodemailer.com/
    Import Nodemailer for email sending
*/
import nodemailer from "nodemailer"

import logError from "./errorLogger.js"
// #endregion



// #region ENV
const TESTING = process.env.NODE_ENV === "testing"
// #endregion



// #region URLs
// Create an object to hold urls based on `env.NODE_ENV`
const envUrls = {
    testing: "https://youtu.be/xvFZjo5PgG0?si=CyDAdn11yOJBg741",
    development: `${process.env.DEV_PROTOCOL}://${process.env.HOST_LAN_IPv4}:${process.env.DEV_PORT}`,
    preview: `${process.env.PREV_PROTOCOL}://${process.env.HOST_LAN_IPv4}:${process.env.PREV_PORT}`,
    production: process.env.NODE_SERVER_ORIGIN
}

// Select the url based on `env.NODE_ENV`
const url = envUrls[process.env.NODE_ENV] || null
if (
    url === null && 
    process.env.NODE_ENV !== "building"
) {
    throw new Error(`Invalid environment variable \`NODE_ENV\`: ${process.env.NODE_ENV}`)
}
// #endregion



// #region Transport
/**
 * Create a `Transport` object.
 * @async
 * 
 * 
 * @param {{
        user: String,
        pass: String,
        "": any[]
    }} [auth] - The credentials for the email account.
 * 
 * @param {{
        "": any[]
    }} [options] - Additional Nodemailer options.
 * 
 * 
 * @returns {Promise<import("@types/nodemailer").Transporter>}
 * A `Transport` object.
 */
const createTransport = async (
        auth = null, 
        options = null
    ) => {

    /**
     * Create Nodemailer test account and return credentials.
     * @async
     * 
     * @returns {Promise<{
            user: String,
            pass: String
        }>}
     * Credentials to create a test `Transport`
     */
    const getTestAuth = async () => {
        try {
            var account = await nodemailer.createTestAccount()
        } catch (error) {
            throw error
        }
        return {
            user: account.user,
            pass: account.pass
        }
    }



    // Initialise `transport` variable
    let transport


    // If credentials are defined
    if (
        typeof auth?.user === "string" && 
        typeof auth?.pass === "string"
    ) {
        // Create email transport, default to gmail config
        transport = nodemailer.createTransport(
            options ? { ...options, auth: auth } :
            {
                service: "gmail",
                host: "smtp.gmail.com",
                auth: auth
            }
        )
        // Add name and address key to object
        transport = Object.assign(transport,
            {
                name: "OhMe" + (TESTING ? " - Testing" : ""),
                address: auth.user
            }
        )
        return transport
    } 


    // Create transport with new credentials
    // If not testing
    transport = !TESTING ?
        // Create transport with default config
        await createTransport({
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }):

        // Create transport with testing config
        await createTransport(
            await getTestAuth(),
            {
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
            }
        )
    return transport
}
// #endregion



// #region Emailer
/**
 * Create an `Emailer` object. Create a `Transport` object if
   one is not provided.
 * @async
 * 
 * 
 * @param {import ("@types/nodemailer").Transporter} [existingTransport] 
   - Optionally provide a `Transport` object.
 *
 * 
 * @returns {Promise<{
        send(to: String | null, args: {"": any[]}) => Promise<import("@types/nodemailer").SentMessageInfo | null>,
        sendVerification(to: String | null, userId: String, code: String) => Promise<import("@types/nodemailer").SentMessageInfo | null>,
        sendPasswordReset(to: String | null, userId: String, code: String) => Promise<import("@types/nodemailer").SentMessageInfo | null>
    }>}
 * An `Object` containing methods to send emails with presets.
 */
const createEmailer = async (existingTransport = null) => {
    // Create a new `Transport` object if one is not provided
    const transport = existingTransport ?? await createTransport()

    return {
        async send(to, options) {
            to ??= transport.address

            // Send email
            try {
                /*
                    Nodemailer has incorrectly typed this method.
                    Ignore the "unnecessary await" tooltip.
                */
                var response = await transport.sendMail({
                    from: {
                        name: transport.name,
                        address: transport.address,
                    },
                    to: to,
                    ...options
                })

            // Catch errors
            } catch (error) {
                // Log error details
                logError({
                    filepath: "src/lib/server.emailUtils.js",
                    message: "Error while sending email",
                    arguments: {
                        to,
                        options
                    },
                    error
                })

                return null
            }
            return response
        },

        async sendVerification(to, userId, code) {
            // Send email with verification link
            return await this.send(to, {
                subject: "Verify Email",
                html: `Click <a href="${url + "/verify?user="+userId+"&code="+code}">here</a> to verify your email address.`
            })
        },

        async sendPasswordReset(to, userId, code) {
            // Send email with reset link
            return await this.send(to, {
                subject: "Reset Password",
                html: `Click <a href="${url + "/reset?user="+userId+"&code="+code}">here</a> to reset your password.`
            })
        }
    }
}
// #endregion



// #region Exports
// Create `emailer` object
const emailer = await createEmailer()

// Define object to hold all email utils
const emailUtils = {
    createTransport,
    createEmailer,
    emailer
}

// Default export for the entire object
export default emailUtils

// Named export for each method
export { createTransport, createEmailer, emailer }
// #endregion