// https://kit.svelte.dev/docs/load#layout-data
// Define load function
export const load = async ({ locals }) => {
    // Get `user` from locals
    const user = locals.user || null

    // Define keys to exclude from `user` object
    const userExclude = {
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

    // Define function to remove excluded keys from an object
    const removeKeys = (obj, removeRule) => {
        // Iterate over key-value pairs
        for (const [key, value] of Object.entries(removeRule)) {
            // If value is true "exclude" the key from `obj`
            if (value === true) {
                delete obj[key]

            // If value is another object, recurse
            } else if (typeof value === "object") {
                removeKeys(obj[key], value)
            }
            // This recursion allows the object to be traversed,
            // "exluding" nested keys
        }
    }

    if (user) removeKeys(user, userExclude)

    console.log(user)

    // Return only the `user` object
    return { user }
}