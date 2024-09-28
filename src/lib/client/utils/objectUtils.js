// #region deleteKeys()
/**
 * Delete certain keys in one object, only if the value of the 
   matching key in another object is true.
 *
 *
 * With support for:
 * - Nested objects
 *
 * @param {{"": any[]}} target - The `Object` to delete keys from.
 * @param {{"": (true | {})[]}} rule - The `Object` containing the keys to delete.
 */
const deleteKeys = (target, rule) => {
    // Throw error if `target` or `rule` are not type `object` or are `null`
    if (
        (typeof target !== "object" || target === null) ||
        (typeof rule !== "object" || rule === null)
    ) {
        throw new Error("`target` and `rule` must be type `object` and not null")
    }



    // Iterate over key-value pairs in `rule`
    for (const [key, value] of Object.entries(rule)) {
        // If `value` is true, delete `target[key]`
        if (value === true) {
            delete target[key]
        } 
        
        // If `value` is type `object` and is not `null`
        else if (typeof value === "object" && value !== null) {
            // If `target[key]` is not type `object` or is `null`
            if (typeof target[key] !== "object" || target[key] === null) {
                target[key] = {}
            }

            // Recurse
            deleteKeys(target[key], value)
        }
    }
}

// #endregion


// #region keepKeys()
/**
 * Keep certain keys in one object, only if the value of the 
   matching key in another object is true.
 *
 *
 * With support for:
 * - Nested objects
 *
 * @param {{"": any[]}} target - The `Object` to delete keys from.
 * @param {{"": (true | {})[]}} rule - The `Object` containing the keys to keep.
 */
const keepKeys = (target, rule) => {
    // Throw error if `target` or `rule` are not type `object` or are `null`
    if (
        (typeof target !== "object" || target === null) ||
        (typeof rule !== "object" || rule === null)
    ) {
        throw new Error("`target` and `rule` must be type `object` and not null")
    }



    // Iterate over keys in `target`
    for (const key of Object.keys(target)) {
        // If `rule[key]` is true, go to next key
        if (rule[key] === true) {
            continue
        } 
        
        // If `rule[key]` is type `object` and is not `null`
        else if (typeof rule[key] === "object" && rule[key] !== null) {
            // If `target[key]` is not type `object` or is `null`
            if (typeof target[key] !== "object" || target[key] === null) {
                target[key] = {}
            }

            // Recurse
            keepKeys(target[key], rule[key])
        }

        // If `rule[key]` is not true, delete `target[key]`
        else delete target[key]
    }
}

// #endregion


// #region checkKeyMatch()
/**
 * Check if the keys in one object equal the value of the
   matching keys in another object.
 * 
 * 
 * With support for:
 * - Nested objects
 * 
 * @param {{"": any[]}} actual - The `Object` containing the keys.
 * @param {{"": any[]}} expected - The `Object` containing the keys to compare.
 */
const checkKeyMatch = (actual, expected) => {
    // Throw error if `actual` or `expected` are not type `object` or are `null`
    if (
        (typeof actual !== "object" || actual === null) ||
        (typeof expected !== "object" || expected === null)
    ) {
        throw new Error("`actual` and `expected` must be type `object` and not null")
    }


    let match = true

    for (const [key, value] of Object.entries(expected)) {
        // If `value` is type `object` and is not `null`
        if (typeof value === "object" && value !== null) {
            // If `actual[key]` is not type `object` or is `null`
            if (typeof actual[key] !== "object" || actual[key] === null) {
                match = false
                return false
            }

            // Recurse
            if (!checkKeyMatch(actual[key], value)) {
                match = false
                return false
            }
        } 
        
        // If `actual[key]` does not equal `value`
        else if (actual[key] !== value) {
            match = false
            return false
        }
    }

    return match
}
// #endregion


// #region deepMerge()
/**
 * Replace the value of keys in one object with the value of the
   matching key in another object.
 *
 *
 * With support for:
 * - Nested objects
 * - Arrays
 * - Circular references
 *
 *
 * @param {{"": any[]}} target - The `Object` to replace keys.
 * @param {{"": any[]}} source - The `Object` containing the new key values.
 * 
 * @param {WeakMap} [visited] - Used to handle circular references during recursion (do not pass this parameter).
 */
const deepMerge = (target, source, visited = new WeakMap()) => {
    // Throw error if `target` or `source` are not type `object` or are null
    if (
        (typeof target !== "object" || target === null) ||
        (typeof source !== "object" || source === null)
    ) {
        throw new Error("`target` and `source` must be type `object` and not null")
    }

    // Throw error if `visited` is not `WeakMap` object
    if (!(visited instanceof WeakMap)) {
        throw new Error("`visited` must be `WeakMap` object")
    }



    // If `source` has already been visited
    if (visited.has(source)) {
        // Return the target stored in `visited` at `source`
        return visited.get(source)
    }

    // Record `target` in `visited at `source`
    visited.set(source, target)


    // Iterate over keys in `source`
    for (const key of Object.keys(source)) {
        // If `source[key]` has already been visited
        if (visited.has(source[key])) {
            // Set `target[key]` to value stored in `visited` at `source[key]`
            target[key] = visited.get(source[key])
        } 

        // If `source[key]` is an `Array` object
        else if (Array.isArray(source[key])) {
            // If `target[key]` is not an `Array` object
            if (!Array.isArray(target[key])) {
                target[key] = []
            }

            // Recursively merge nested arrays
            deepMerge(target[key], source[key], visited)
        }

        // If `source[key]` is type `object` and is not `null`
        else if (typeof source[key] === "object" && source[key] !== null) {
            // If `target[key]` is not type `object` or is `null`
            if (typeof target[key] !== "object" || target[key] === null) {
                target[key] = {}
            }

            // Recursively merge nested objects
            deepMerge(target[key], source[key], visited)
        }
        
        // If `source[key]` is primitive value or function
        else {
            // Set value from source to target
            target[key] = source[key]
        }
    }
}
// #endregion


// #region mapWithRule()
/**
 * Replace certain value of keys in one object with the result of 
   passing them into a function, only if the value of the matching 
   key in another object is true.
 *
 *
 * With support for: 
 * - Nested objects
 * 
 * 
 * @param {{"": any[]}} target - The `Object` to replace keys.
 * @param {{"": true[]}} rule - The `Object` containing the keys to replace.
 * @param {(value: any) => any} func - The `Function` to pass the value of keys into.
 */
const mapWithRule = (target, rule, func) => {
    // Throw error if `target` or `rule` are not type `object` or are `null`
    if (
        (typeof target !== "object" || target === null) ||
        (typeof rule !== "object" || rule === null)
    ) {
        throw new Error("`target` and `rule` must be type `object` and not null")
    }

    // Throw error if `func` is not type `function`
    if (typeof func !== "function") {
        throw new Error("`func` must be type `function`")
    }



    // Iterate over key-value pairs in `rule`
    for (const [key, value] of Object.entries(rule)) {
        /*
            If `value` is true, set `target[key]` to 
            the result of calling `func()` with the 
            current value passed as the first parameter
            (`target[key] = func(target[key])`).
            Effectively running `func` on the current value.
        */
        if (value === true) {
            target[key] = func(target[key])
        } 
        
        // If `value` is type `object` and is not `null`
        else if (typeof value === "object" && value !== null) {
            // If `target[key]` is not type `object` or is `null`
            if (typeof target[key] !== "object" || value === null) {
                target[key] = {}
            }

            // Recurse
            mapWithRule(target[key], value, func)
        }
    }
}
// #endregion


// #region splitKeysIntoArray()
/**
 * Split an object into an array where each non-object value is
   stored in an object with a key matching the original key.
 *
 *
 * With support for:
 * - Nested objects
 * 
 * 
 * @param {{"": any[]}} target - The `Object` to flatten.
 * 
 * @returns {{"": any[]}[]} - The flattened array.
 */
const splitKeysIntoArray = (target) => {
    // Throw error if `target` is not type `object` or is `null`
    if (typeof target !== "object" || target === null) {
        throw new Error("`target` must be type `object` and not null")
    }


    const result = []

    for (const [key, value] of Object.entries(target)) {
        // If `value` is type `object` and is not `null`
        if (typeof value === "object" && value !== null) {
            // Recurse
            const nested = splitKeysIntoArray(value)
            for (const item of nested) {
                result.push({ [key]: item })
            }
        } 
        
        // If `value` is not type `object` or is `null`
        else {
            result.push({ [key]: value })
        }
    }

    return result
}
// #endregion



// #region Exports
// Define object to hold all object utils
const objectUtils = {
    deleteKeys,
    keepKeys,
    checkKeyMatch,
    deepMerge,
    mapWithRule,
    splitKeysIntoArray
}

// Default export for the entire object
export default objectUtils

// Named exports for each method
export { deleteKeys, keepKeys, checkKeyMatch, deepMerge, mapWithRule, splitKeysIntoArray }
// #endregion