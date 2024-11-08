// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import { collapseDBActionDataRecord } from "$lib/server/database/actions/utils.js"
import { keepKeys, checkKeyMatch, splitKeysIntoArray, getDotNotation } from "$lib/client/utils/objectUtils.js"
import logError from "$lib/server/utils/errorLogger.js"

import { Prisma } from "@prisma/client" // For type definitions
// #endregion Imports



// #region Actions

// Define record to include specific relations in the `User` table
/** @type {Prisma.UserInclude} */
const userInclude = {
    email: true,
    password: true,
    sessions: true,
    frRqSent: true,
    frRqReceived: true
}

// Define record to include unique fields in the `User` table
const userUnique = {
    id: true,
    username: true,
    email: {
        id: true,
        address: true,
        verifyCode: true
    },
    password: {
        id: true,
        resetCode: true
    },
    sessions: {
        id: true
    }
}



// #region create()
/**
 * Create a `User` entry.
 * @async
 * 
 * @param {Prisma.UserCreateInput} data -
   The data used to create the `User` entry.
 */
const create = async (data) => {
    try {
        // Get the unique fields in `data` that are already taken
        const fU_pUFResponse = await findUnique__perUniqueField(collapseDBActionDataRecord(data))

        // Check the query was successful
        if (!fU_pUFResponse.success) {
            return {
                user: null,
                success: false,
                error: `user.findUnique__perUniqueField(): ${fU_pUFResponse.error}`
            }
        }

        // Check if any unique fields are already taken
        if (fU_pUFResponse.fieldMatches !== null) {
            return {
                user: null,
                success: false,
                error: "Unique fields already taken",
                target: Object.keys(fU_pUFResponse.fieldMatches)
            }
        }


        // Create the `User` entry
        const user = await dbClient.user.create({
            include: userInclude,
            data: data
        })

        return {
            user: user,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while creating `User` entry",
            arguments: {
                data: data
            },
            error
        })

        return {
            user: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion create()


// #region findUnique()
/**
 * Get a single `User` entry.
 * @async
 * 
 * @param {Prisma.UserWhereInput} filter - 
   The filter used to check `User` entries.
 */
const findUnique = async (filter) => {
    try {
        /*
            Find `User` entries matching the filter 
            but stop at 2 results.
        */
        const users = await dbClient.user.findMany({
            include: userInclude,
            take: 2, // Stop at 2 results
            where: filter
        })


        // No results found
        if (users.length === 0) return {
            user: null,
            success: false,
            error: "No entry found"
        }

        // Multiple results found
        if (users.length > 1) return {
            user: null,
            success: false,
            error: "Multiple entries found"
        }


        // Return the single result
        return {
            user: users[0],
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while getting `User` entry",
            arguments: {
                where: filter
            },
            error
        })

        return {
            user: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion findUnique()


// #region findMany()
/**
 * Get multiple `User` entries.
 * @async
 * 
 * @param {Prisma.UserFindManyArgs} options - 
   The options used in the query.
 */
const findMany = async (options) => {
    try {
        // Find `User` entries
        const users = await dbClient.user.findMany({
            include: userInclude,
            ...options
        })


        // No results found
        if (users.length === 0) return {
            users: [], // `[]` because the query was successful
            success: true,
            error: "No entries found"
        }


        // Return the results
        return {
            users: users,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while getting `User` entries",
            arguments: {
                options: options
            },
            error
        })

        return {
            users: null, // `null` because the query failed
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion findMany()


// #region findUnique__PerUniqueField()
/**
 * Take a filter and parse it to remove fields that 
   do not have unique constraints.
 *
 * Separate the fields into individual records, then
   use `findMany()` to get all the entries that match
   one or more of the unique fields.
 * 
 * Return all the fields that values are "taken"
   along with the matching entry.
 * 
 *
 * 
 * @param {{"": any[]}} filter - 
   The filter to check for taken unique fields.
 */
const findUnique__perUniqueField = async (filter) => {

    // Define subroutine to parse `data`
    const getUniqueFields = (() => {
        const obj = filter
        keepKeys(obj, userUnique)
        return obj
    })

    // Define subroutine to check if deepest nested field is null
    const checkDeepNull = (obj) => {
        // Get the first value in the object
        const firstValue = obj[Object.keys(obj)[0]]

        // If first value is an object
        if (
            typeof firstValue === "object" && 
            firstValue !== null
        ) {
            // Recurse
            return checkDeepNull(firstValue)
        }

        // If first value is null
        else if (firstValue === null) {
            return true
        }

        return false
    }


    try {

        // Get the unique fields
        const uniqueFields = getUniqueFields()


        // Split the unique fields into individual records
        const splitFields = splitKeysIntoArray(uniqueFields)

        // For each record, If deepest nested field is null, remove it from the Array
        for (const [index, record] of splitFields.entries()) {
            if (checkDeepNull(record)) {
                splitFields.splice(index, 1)
            }
        }
        // This is so unique fields with null values are not checked for uniqueness


        // Find all the entries that match one of the unique fields
        const findManyResponse = await findMany({
            where: { OR: splitFields }
        })

        // Check if the query was successful
        if (!findManyResponse.success) {
            return {
                fieldMatches: null,
                success: false,
                error: findManyResponse.error
            }
        }

        /* 
            Add a key-value pair for each field that has a match
            in the returned entries.
        */
        const fieldMatches = {}
        for (const user of findManyResponse.users) {
            for (const [index, field] of splitFields.entries()) {
                /*
                    Check if the key or nested keys in the field 
                    object match the same key(s) in the user
                    object.
                */
                if (checkKeyMatch(user, field)) {
                    // Set the key-value pair
                    fieldMatches[getDotNotation(field)] = user

                    /*
                        Remove the field from the array since it 
                        is unique and will only find one match.
                    */
                    splitFields.splice(index, 1)
                }
            }
        }

        return {
            fieldMatches: Object.keys(fieldMatches).length > 0 ? 
                fieldMatches : 
                null,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while finding `User` entry for each unique field",
            arguments: {
                filter: filter
            },
            error
        })

        return {
            fieldMatches: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion findUniquePerUniqueField()


// #region update()
/**
 * Update a the fields of a `User` entry.
 * @async
 * 
 * 
 * @param {Prisma.UserWhereInput} filter - 
   The filter used to check `User` entries.
 *
 * @param {Prisma.UserUpdateInput} data - 
   The data to update the `User` entry.
 */
const update = async (filter, data) => {
    try {
        // Get the `User` entry that matches the filter
        const findUniqueResponse = await findUnique(filter)

        // Check a `User` entry was found
        if (!findUniqueResponse.success) {
            return {
                user: null,
                success: false,
                error: findUniqueResponse.error
            }
        }


        // Get the unique fields in `data` that are already taken
        const fU_pUFResponse = await findUnique__perUniqueField(collapseDBActionDataRecord(data))

        // Check the query was successful
        if (!fU_pUFResponse.success) {
            return {
                user: null,
                success: false,
                error: fU_pUFResponse.error
            }
        }

        // Check if any unique fields are already taken
        if (fU_pUFResponse.fieldMatches !== null) {
            return {
                user: null,
                success: false,
                error: "Unique fields already taken",
                target: Object.keys(fU_pUFResponse.fieldMatches)
            }
        }


        // Update the `User` entry
        const user = await dbClient.user.update({
            include: userInclude,
            where: {
                id: findUniqueResponse.user.id
            },
            data: data
        })

        return {
            user: user,
            success: true,
            error: null
        }

    } catch (error) {
        // Log error details
        logError({
            filepath: "src/lib/server/database/actions/user.js",
            message: "Error while updating `User` entry",
            arguments: {
                filter: filter,
                data: data
            },
            error
        })

        return {
            user: null,
            success: false,
            error: "An error occurred"
        }
    }
}
// #endregion update()

// #endregion Actions



// #region Exports

// Define object to hold all `User` actions
const userActions = {
    create,
    findUnique,
    findMany,
    update
}

// Default export for the entire object
export default userActions

// Named export for each action
export { 
    create,
    findUnique, 
    findMany, 
    update 
}

// #endregion Exports