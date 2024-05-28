// Define function to delete keys from an object
const removeKeys = (obj, removeRule) => {
    // Iterate over key-value pairs
    for (const [key, value] of Object.entries(removeRule)) {
        // If value is true, delete the key from `obj`
        if (value === true) {
            delete obj[key]

        // If value is another object, recurse
        } else if (typeof value === "object") {
            removeKeys(obj[key], value)
        }
        // This recursion allows the object to be traversed,
        // deleting nested keys
    }
}

// Define keys to delete from `user` object
const userDelete = {
    id: true,
    emailId: true,
    passwordId: true,
    email: {
        id: true,
        verifyCode: true
    },
    password: {
        id: true,
        hash: true,
        resetCode: true
    },
    sessions: true
}

// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({ locals }) => {
    // Get `user` from locals
    const user = locals.user || null

    // Delete keys containing sensitive data
    // to avoid client-side data leaks
    if (user) removeKeys(user, userDelete)

    // Return only the `user` object
    return { user }
}