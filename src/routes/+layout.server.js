// Define function to delete keys from an object
const removeKeys = (object, removeRule) => {
    // Clone the object to not make changes to the original
    const obj = structuredClone(object)

    // Iterate over key-value pairs
    for (const [key, value] of Object.entries(removeRule)) {
        // If value is true, delete the key
        if (value === true) {
            delete obj[key]

        // If value is another object, recurse
        } else if (typeof value === "object") {
            obj[key] = removeKeys(obj[key], value)
        }
        // This recursion allows the object to be traversed,
        // deleting nested keys
    }

    // Return the new object
    return obj
}


// Define keys to delete from the `user` object
const userDelete = {
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
    friended: true,
    friendOf: true
}


// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({ locals }) => {
    // Get `user` from locals
    let { user } = locals || null

    // Delete keys containing sensitive data
    // to avoid client-side data leaks
    if (user) user = removeKeys(user, userDelete)

    // Return the filtered `user` object
    return { user }
}