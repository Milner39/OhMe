// Import settings
import { settings as allSettings } from "../settings"
const { sanitization: settings } = allSettings

// Create object with methods to handle user inputs
export const inputHandler = {
    // #region VALIDATION
    // Functions to validate input formats
    validate: {
        // IMPROVE: Use switch case statement to check for more specific error messages
        // Example: case email.length > 50 { error.email = "Email too long"}
        // If no cases are hit, no errors
        username: (input) => {
            return (
                typeof input === "string" &&
                input.length <= 25 &&
                input.length >= 1 &&
                // ^              Start string
                // (?!\s)         Anything but whitespace
                // (.*?)          Any character can follow 0 or more times
                // (?<!\s)        Anything but whitespace
                // $              End string
                // Prevents strings starting or ending in spaces
                /^(?!\s)(.*?)(?<!\s)$/.test(input)
            ) 
        },
        password: (input) => {
            return (
                typeof input === "string" &&
                input.length <= 50 &&
                input.length >= 1 &&
                // ^              Start string
                // (?!\s)         Anything but whitespace
                // (.*?)          Any character can follow 0 or more times
                // (?<!\s)        Anything but whitespace
                // $              End string
                // Prevents strings starting or ending in spaces
                /^(?!\s)(.*?)(?<!\s)$/.test(input)
            ) 
        },
        email: (input) => {
            return (
                typeof input === "string" &&
                input.length <= 320 &&
                // ^                      Start string
                // [^\s@]+                (local) 1 or more non-whitespace, non: "@" chars
                // @                      Single "@"
                // [^\s@.]+               (domain) 1 or more non-whitespace, non: "@" or "." chars
                // (?:\.[^\s@.]+)*        (subdomains) 0 or more subdomains
                // \.                     Single "."
                // [A-Za-z]{2,}           (TLD) 2 or more of these chars
                // $                      End string
                // Standard email address format
                /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(input)
            )
        },
        uuid: (input) => {
            return (
                typeof input === "string" &&
                // Standard UUID format
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(input)
            )
        }
    },
    // #endregion



    // #region (DE)SANITATION
    // Prisma uses "Prepared statements" so input sanitation is not necessary
    // as there is no risk of SQL injection attacks.
    // It will be used regardless of necessity in case the database provider is changed in the future
    sanitize: (input) => {
        if (typeof input !== "string") {
            throw new Error("'input' must be type 'string'")
        }
        let sanitized = input
        // Replace special characters with escape codes
        for (const charCode of settings.charCodes) {
            sanitized = sanitized.replaceAll(charCode.char, charCode.code)
        }
        return sanitized
    },

    desanitize: (input) => {
        if (typeof input !== "string") {
            throw new Error("'input' must be type 'string'")
        }
        let desanitized = input
        // Clone the array and remove the first item
        const firstCharCodes = [...settings.charCodes]
        firstCharCodes.shift()
        // Replace escape codes with original characters
        for (const charCode of firstCharCodes) {
            desanitized = desanitized.replaceAll(charCode.code, charCode.char)
        }
        // Replace the escape code representing the character 
        // that indicates the start of an escape code last
        return desanitized.replaceAll(settings.charCodes[0].code, settings.charCodes[0].char)
    }
    // #endregion
}