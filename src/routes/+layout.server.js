// Import inputHandler to validate and sanitize inputs
import { inputHandler } from "$lib/server/inputHandler.js"


const formatObject = {
    // Method to delete keys
    deleteKeys: (object, rule) => {
        // Clone the object to not make changes to the original
        const obj = structuredClone(object)

        // Iterate over key-value pairs of the `rule`
        for (const [key, value] of Object.entries(rule)) {
            // If value is true, delete the key
            if (value === true) {
                delete obj[key]

            // If value is another object, recurse
            } else if (typeof value === "object") {
                obj[key] = formatObject.deleteKeys(obj[key], value)
            }
        }
        // Return the new object
        return obj
    },

    // Method to desanitize keys
    desanitizeKeys: (object, rule) => {
        // Clone the object to not make changes to the original
        const obj = structuredClone(object)

        // Iterate over key-value pairs of the `rule`
        for (const [key, value] of Object.entries(rule)) {
            // If value is true, delete the key
            if (value === true) {
                obj[key] = inputHandler.desanitize(obj[key])

            // If value is another object, recurse
            } else if (typeof value === "object") {
                obj[key] = formatObject.desanitizeKeys(obj[key], value)
            }
        }
        // Return the new object
        return obj
    }
}


// Define keys to delete from the `user` object
const deleteKeys = {
    id: true,
    email: {
        id: true,
        verifyCode: true,
        userId: true
    },
    password: {
        id: true,
        hash: true,
        resetCode: true,
        userId: true
    },
    sessions: true,
    frRqSent: true,
    frRqReceived: true
}

// Define keys to desanitize in the `user` object
const desanitizeKeys = {
    username: true,
    email: {
        address: true
    }
}


// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({ locals }) => {
    // Get `user` from locals
    let { user } = locals || null

    if (user) {
        // Delete keys containing sensitive data
        // to avoid client-side data leaks
        user = formatObject.deleteKeys(user, deleteKeys)

        // Desanitize keys that have been sanitized
        // so values are displayed the way the client entered them
        user = formatObject.desanitizeKeys(user, desanitizeKeys)
    }

    // Return the formatted `user` object
    return { user }
}