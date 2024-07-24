// https://oslo.js.org/reference/password/Argon2id/
// "Provides methods for hashing passwords and verifying hashes with argon2id"
// Import `Argon2id` class
import { Argon2id } from "oslo/password"

// Declare a `global.argonInstance` variable to prevent multiple instances
global.argonInstance

// Use `global.argonInstance` if it is declared or initialise one
const stringHasher = global.argonInstance || new Argon2id()

// Set `global.argonInstance` if running in development mode
if (process.env.NODE_ENV === "development") {
    global.argonInstance = stringHasher
}

// Create a hash that will always cause
// `stringHasher.verify(failHash, String)` to return false
const failHash = await stringHasher.hash("")

export { 
    stringHasher,
    failHash
}