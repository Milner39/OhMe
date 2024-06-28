// Create object to with methods to handle user inputs
const inputHandler = {
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

    // Prisma uses "Prepared statements" so input sanitation is not necessary as there is no risk of SQL injection attacks
    // It will be used regardless of necessity in case the database provider is changed in the future
    sanitize: (input) => {
        // Replace all special characters attacks with escape codes
        return input
            .replace(/&/g, "&amp")
            .replace(/#/g, "&hsh")
            .replace(/\$/g, "&dlr")
            .replace(/</g, "&ltn")
            .replace(/>/g, "&gtn")
            .replace(/'/g, "&sqt")
            .replace(/"/g, "&dqt")
            .replace(/\\/g, "&bsl")
            .replace(/\//g, "&fsl")
            .replace(/\*/g, "&ast")
            .replace(/=/g, "&eql")
            .replace(/%/g, "&pct")
            .replace(/\+/g, "&pls")
            .replace(/-/g, "&dsh")
            .replace(/_/g, "&uds")
            .replace(/:/g, "&fcn")
            .replace(/;/g, "&scn")
            // & is the symbol for the escape codes
    },

    desanitize: (sanitized) => {
        // Replace all escape codes with original characters
        return sanitized
            .replace(/&hsh/g, "#")
            .replace(/&dlr/g, "$")
            .replace(/&ltn/g, "<")
            .replace(/&gtn/g, ">")
            .replace(/&sqt/g, "'")
            .replace(/&dqt/g, "\"")
            .replace(/&bsl/g, "\\")
            .replace(/&fsl/g, "/")
            .replace(/&ast/g, "*")
            .replace(/&eql/g, "=")
            .replace(/&pct/g, "%")
            .replace(/&pls/g, "+")
            .replace(/&dsh/g, "-")
            .replace(/&uds/g, "_")
            .replace(/&fcn/g, ":")
            .replace(/&scn/g, ";")
            .replace(/&amp/g, "&")
            // & MUST come last as it is the symbol for the escape codes
    }
}

export { inputHandler }