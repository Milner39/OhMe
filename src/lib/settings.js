// Settings to control values across the application
export const settings = {
    urls: {
        login: "/login"
    },
    sanitization: {
        // Characters and corresponding codes used for input sanitation
        charCodes: [
            { char: "&", code: "&amp" },
            { char: "#", code: "&hsh" },
            { char: "$", code: "&dlr" },
            { char: "<", code: "&ltn" },
            { char: ">", code: "&gtn" },
            { char: "'", code: "&sqt" },
            { char: "\"", code: "&dqt" },
            { char: "\\", code: "&bsl" },
            { char: "/", code: "&fsl" },
            { char: "*", code: "&ast" },
            { char: "=", code: "&eql" },
            { char: "%", code: "&pct" },
            { char: "+", code: "&pls" },
            { char: "-", code: "&dsh" },
            { char: "_", code: "&uds" },
            { char: ":", code: "&fcn" },
            { char: ";", code: "&scn" }
        ]
        // Rules:
            // The `char` indicating the start of a `code` ("&") 
            // must be the `char` of the first item in charCodes
            // ({ char: "&", code: "&amp" })
    },
    session: {
        // How long a session persists before expiring
        duration: 21, // Days

        // How long before expiring should session duration be renewed
        renewalLead: 7, // Days

        // Rules:
            // duration >= renewalLead
    },
    password: {
        // How long a code persists before expiring
        duration: 1, // Hours

        // How long a client has to wait between requesting another code
        cooldown: 1, // Hours

        // Rules:
            // duration >= cooldown
    },
    email: {
        // How long a code persists before expiring
        duration: 1, // Hours

        // How long a client has to wait between requesting another code
        cooldown: 1, // Hours

        // Rules:
            // duration >= cooldown        
    }
}