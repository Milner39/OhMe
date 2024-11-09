// #region Imports

// Import settings
import { settings as allSettings } from "$lib/settings.js"
const { sanitization: settings } = allSettings
// #endregion



// Create an object with subroutines to handle user inputs
const inputHandler = {
    // #region Validation
    // Subroutines to validate inputs match certain formats
    validate: {
        /*
            IMPROVE: Return specific reasons why checks fail.
            Example: case email.length > 50 { error.email = "Email too long"}
        */

        /**
         * Check if a string fits the format for a username.
         * 
         * @param {String} input - The `String` to check.
         * 
         * @returns {Boolean}
         */
        username: (input) => {
            return (
                typeof input === "string" &&
                input.length <= 50 &&
                input.length >= 1 &&
                /*  
                    ^              Start string
                    (?!\s)         Anything but whitespace
                    (.*?)          Any character can follow 0 or more times
                    (?<!\s)        Anything but whitespace
                    $              End string
                    Prevents strings starting or ending in spaces
                */
                /^(?!\s)(.*?)(?<!\s)$/.test(input)
            ) 
        },


        /**
         * Check if a string fits the format for a password.
         * 
         * @param {String} input - The `String` to check.
         * 
         * @returns {Boolean}
         */
        password: (input) => {
            return (
                typeof input === "string" &&
                input.length <= 256 &&
                input.length >= 8 &&
                /*
                    ^              Start string
                    (?!\s)         Anything but whitespace
                    (.*?)          Any character can follow 0 or more times
                    (?<!\s)        Anything but whitespace
                    $              End string
                    Prevents strings starting or ending in spaces
                */
                /^(?!\s)(.*?)(?<!\s)$/.test(input)
            ) 
        },


        /**
         * Check if a string fits the format for an email.
         * 
         * @param {String} input - The `String` to check.
         * 
         * @returns {Boolean}
         */
        email: (input) => {
            return (
                typeof input === "string" &&
                input.length <= 320 &&
                /*
                    ^                      Start string
                    [^\s@]+                (local) 1 or more non-whitespace, non: "@" chars
                    @                      Single "@"
                    [^\s@.]+               (domain) 1 or more non-whitespace, non: "@" or "." chars
                    (?:\.[^\s@.]+)*        (subdomains) 0 or more subdomains
                    \.                     Single "."
                    [A-Za-z]{2,}           (TLD) 2 or more of these chars
                    $                      End string
                    Standard email address format
                */
                /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(input)
            )
        },



        /**
         * Check if a string fits the format for a uuid.
         * 
         * @param {String} input - The `String` to check.
         * 
         * @returns {Boolean}
         */
        uuid: (input) => {
            return (
                typeof input === "string" &&
                // Standard UUID format
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(input)
            )
        }
    },
    // #endregion



    // #region Sanitization
    /**
     * Replace certain chars with escape code representations.
     * 
     * @param {String} input - The `String` to sanitize.
     * 
     * @returns {String}
     */
    sanitize: (input) => {
        if (typeof input !== "string") {
            throw new Error("`input` must be type `string`")
        }

        let sanitized = input

        // Replace special characters with escape codes
        for (const charCode of settings.charCodes) {
            sanitized = sanitized.replaceAll(charCode.char, charCode.code)
        }
        return sanitized
    },
    // #endregion



    // #region Desanitization
    /**
     * Replace escape codes with the char they represent.
     * 
     * @param {String} input - The `String` to desanitize.
     * 
     * @returns {String}
     */
    desanitize: (input) => {
        if (typeof input !== "string") {
            throw new Error("`input` must be type `string`")
        }

        let desanitized = input

        // Clone the array and remove the first item
        const firstCharCodes = [...settings.charCodes]
        firstCharCodes.shift()

        // Replace escape codes with original characters
        for (const charCode of firstCharCodes) {
            desanitized = desanitized.replaceAll(charCode.code, charCode.char)
        }
        /* 
           Lastly, replace the escape code representing the character 
           that indicates the start of an escape code. 
        */
        return desanitized.replaceAll(settings.charCodes[0].code, settings.charCodes[0].char)
    }
    // #endregion
}



// #region Exports

// Default export
export default inputHandler

// #endregion