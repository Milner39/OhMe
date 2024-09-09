// #region Imports
/* 
    https://nodemailer.com/
    "Nodemailer is a module for Node.js applications to allow easy as cake email sending."
*/
import nodemailer from "nodemailer"
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
// Define a subroutine to create a `Transport` object
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
                name: "OhMe" + (process.env.NODE_ENV === "testing" ? " - Testing" : ""),
                address: auth.user
            }
        )

    // Get credentials based on `env.NODE_ENV`
    } else {
        // If not testing:
        transport = process.env.NODE_ENV !== "testing" ?
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
    }
    return transport
}
// #endregion



// #region Mail
/*
    Define a subroutine to create a `Mail` object
    with subroutines to send emails.
*/
const createMail = async (existingTransport = null) => {
    // Create a new `Transport` object if one is not provided
    const transport = existingTransport || await createTransport()
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



//const mail = await createMail()
export { createTransport, createMail }

//TODO: rename to emailUtils and createMail should be createEmailer