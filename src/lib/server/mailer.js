// Import function to create mail transporter to send emails
import nodemailer from "nodemailer"

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

// Create custom mail handler that can be used in server-side form actions
const mail = {
    sendVerification: (to, code) => {
        // Select url based on enviromental variables
        const url = process.env.NODE_ENV === "development" ? 
        "http://"+process.env.NODE_SERVER_HOST+":5173" :
        process.env.NODE_SERVER_ORIGIN
        // Send email with verification link
        try {
            transporter.sendMail({
                from: {
                    name: "OhMe",
                    address: process.env.PRIVATE_EMAIL_USER
                },
                to: to,
                subject: "Verify Email",
                text: `Verification link: ${url + "/verify/" + code}`
            })
        } catch (err) {
            throw err
        }
    }
}

export { mail }