// Create `sanitizer` object to be used server-side form actions
const sanitizer = {
    
    // IMPROVE: Use switch case statement to check for more specific error messages
    // Example: case email.length > 50 { error.email = "Email too long"}
    // If no cases are hit, no errors

    username: (input) => {
        return (
            typeof input === "string" &&
            input.length <= 25 &&
            // ^                                         Start string
            // [A-Za-z0-9!?%&_:;()@#~,.=+-]              String starts with 1 of these chars
            // (?:[A-Za-z0-9 !?%&_:;()@#~,.=+-]*...)?    If string contains more of these chars...
            // [A-Za-z0-9!?%&_:;()@#~,.=+-]              it must end with one of these chars
            // $                                         End string
            // Prevents strings starting or ending in spaces
            /^[A-Za-z0-9!?%&_:;()@#~,.=+-](?:[A-Za-z0-9 !?%&_:;()@#~,.=+-]*[A-Za-z0-9!?%&_:;()@#~,.=+-])?$/.test(input)
        ) 
    },
    password: (input) => {
        return (
            typeof input === "string" &&
            input.length <= 50 &&
            // ^                                         Start string
            // [A-Za-z0-9!?%&_:;()@#~,.=+-]              String starts with 1 of these chars
            // (?:[A-Za-z0-9 !?%&_:;()@#~,.=+-]*...)?    If string contains more of these chars...
            // [A-Za-z0-9!?%&_:;()@#~,.=+-]              it must end with one of these chars
            // $                                         End string
            // Prevents strings starting or ending in spaces
            /^[A-Za-z0-9!?%&_:;()@#~,.=+-](?:[A-Za-z0-9 !?%&_:;()@#~,.=+-]*[A-Za-z0-9!?%&_:;()@#~,.=+-])?$/.test(input)
        ) 
    },
    email: (input) => {
        return (
            typeof input === "string" &&
            input.length <= 100 &&
            // ^                       Start string
            // [A-Za-z0-9_(),.+-]+     String starts with 1 or more of these chars
            // @                       Single "@" must follow
            // [A-Za-z0-9-]+           1 domain (1 or more of these chars)
            // (?:\.[a-zA-Z0-9-]+)*    0 or more subdomains
            // \.                      Single "." before TLD
            // [A-Za-z]{2,}            TLD (2 or more of these chars)
            // $                       End string
            // Standard email address format
            /^[A-Za-z0-9_(),.+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(input)
        )
    }
}

export { sanitizer }