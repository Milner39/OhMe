// https://nodemailer.com/
// "Nodemailer is a module for Node.js applications to allow easy as cake email sending."
// Import function to create mail transporter to send emails
import nodemailer from "nodemailer"

// Configure urls based on environment variables
const envUrls = {
    development: `${process.env.DEV_PROTO}://192.168.0.63:${process.env.DEV_PORT}`,
    preview: `${process.env.PREV_PROTO}://192.168.0.63:${process.env.PREV_PORT}`,
    production: process.env.NODE_SERVER_ORIGIN
}

// Select url based on node environment
const url = envUrls[process.env.NODE_ENV] || null

// Create mail transporter for a gmail account,
// using credentials from .env
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smpt.gmail.com",
    auth: {
        user: process.env.PRIVATE_EMAIL_USER,
        pass: process.env.PRIVATE_EMAIL_PASS
    }
})

// Create `mail` object to be used in server-side form actions
const mail = {
    sendVerification: (to, userId, code) => {
        // Send email with verification link
        try {
            transporter.sendMail({
                from: {
                    name: "OhMe",
                    address: process.env.PRIVATE_EMAIL_USER
                },
                to: to,
                subject: "Verify Email",
                html: `Click <a href="${url + "/verify?user="+userId+"&code="+code}">here</a> to verify your email address.`
            })
        } catch (err) {
            throw err
        }
    },
    sendReset: (to, userId, code) => {
        // Send email with reset link
        try {
            transporter.sendMail({
                from: {
                    name: "OhMe",
                    address: process.env.PRIVATE_EMAIL_USER
                },
                to: to,
                subject: "Reset password",
                html: `Click <a href="${url + "/reset?user="+userId+"&code="+code}">here</a> to reset your password.`
            })
        } catch (err) {
            throw err
        }
    }
}

export { mail }