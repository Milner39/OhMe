// Import function to create Argon2id object
import { Argon2id } from "oslo/password"

// Declare a global argon variable to prevent multiple instances
global.argonInstance

// Use the global argon instance if it exists or initalise one
const stringHasher = global.argonInstance || new Argon2id()

// Set the global argon instance if running in development mode
if (process.env.NODE_ENV === "development") {
    global.argonInstance = stringHasher
}

// Create a hash that will always cause
// stringHasher.verify(failHash, String) to return false
const failHash = await stringHasher.hash("")

export { 
    stringHasher,
    failHash
}