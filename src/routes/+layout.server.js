// #region Imports
import { deleteKeys, mapWithRule } from "$lib/client/utils/objectUtils.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
// #endregion



// Define keys to delete from the `user` object
const deleteKeysRule = {
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
const desanitizeKeysRule = {
    username: true,
    email: {
        address: true
    }
}



/* 
    Define load subroutine to:
    Check if the client is logged in. If they are:
        - Delete sensitive data from client's `User` entry.
        - Desanitize sanitized data in client's `User` entry.
*/
/** @type {import("./$types").LayoutServerLoad} */
export const load = async ({ locals }) => {
    // Get `user` from locals
    const { user } = locals

    // If client is not logged in
    if (!user) {
        return { user }
    }

    
    // Create clone of `user` to not make changes to the original
    const userClone = structuredClone(user)

    /*
        Delete keys containing sensitive data
        to avoid client-side data leaks.
    */
    deleteKeys(userClone, deleteKeysRule)

    /*
        Desanitize keys that have been sanitized
        so values are displayed the way the client 
        entered them
    */
    mapWithRule(userClone, desanitizeKeysRule, inputHandler.desanitize)


    // Return client-safe, desanitized user data
    return { user: userClone }
}



// #region DOCS

// Resources explaining layout load subroutines
// https://kit.svelte.dev/docs/load#layout-data

// #endregion