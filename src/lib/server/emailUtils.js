// #region Imports
/* 
    https://nodemailer.com/
    Import Nodemailer for email sending
*/
import nodemailer from "nodemailer"
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
    throw new Error(`Invalid environment variable 'NODE_ENV': ${process.env.NODE_ENV}`)
}
// #endregion



// #region Transport
// Define a subroutine to create a `transport` object
const createTransport = async (auth = { 
    user: null, 
    pass: null
}, args = null) => {

    // Define subroutine to get Nodemailer test account credentials
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



    // Initialise transport variable
    let transport


    // If credentials are defined:
    if (auth.user && auth.pass) {
        // Create email transport, default to gmail config
        transport = nodemailer.createTransport(
            args ? { ...args, auth: auth } :
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
    // If not testing:
    transport = !TESTING ?
        // Create transport with default config
        await createTransport({
            user: process.env.PRIVATE_EMAIL_USER,
            pass: process.env.PRIVATE_EMAIL_PASS
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
/*
    Define a subroutine to create an `emailer` object
    with subroutines to send emails.
*/
const createEmailer = async (existingTransport = null) => {
    // Create a new `Transport` object if one is not provided
    const transport = existingTransport || await createTransport()

    // Return methods to send emails with different presets
    return {
        send: async (to, args) => {
            // Send email
            try {
                var response = await transport.sendMail({
                    from: {
                        name: transport.name,
                        address: transport.address,
                    },
                    to: to ? to : transport.address,
                    ...args
                })
            } catch (error) {
                throw error
            }
            return response
        },
        sendVerification: async (to, userId, code) => {
            // Send email with verification link
            try {
                await transport.sendMail({
                    from: {
                        name: transport.name,
                        address: transport.address
                    },
                    to: to,
                    subject: "Verify Email",
                    html: `Click <a href="${url + "/verify?user="+userId+"&code="+code}">here</a> to verify your email address.`
                })
            } catch (error) {
                throw error
            }
        },
        sendReset: async (to, userId, code) => {
            // Send email with reset link
            try {
                await transport.sendMail({
                    from: {
                        name: transport.name,
                        address: transport.address
                    },
                    to: to,
                    subject: "Reset Password",
                    html: `Click <a href="${url + "/reset?user="+userId+"&code="+code}">here</a> to reset your password.`
                })
            } catch (error) {
                throw error
            }
        }
    }
}
// #endregion



// #region Export
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