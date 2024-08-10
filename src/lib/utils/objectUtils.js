// #region Utils
/*
    Define a subroutine to replace certain values in 
    an object with the value of the matching key 
    in another object.
*/
const deepMerge = (target, source, visited = new WeakMap()) => {
    // Throw error if `target` or `source` are not type `object` or are null
    if (
        (typeof target !== "object" || target === null) ||
        (typeof source !== "object" || source === null)
    ) {
        throw new Error("'target' and 'source' must be type 'object' and not null")
    }

    // If `source` has already been visited:
    if (visited.has(source)) {
        // Return the target stored in the WeakMap at `source`
        return visited.get(source)
    }

    // Record `target` in the WeakMap at `source`
    visited.set(source, target)

    // Iterate over keys in `source`
    for (const key of Object.keys(source)) {
        // If `source[key]` is an array:
        if (Array.isArray(source[key])) {
            // If `source[key]` has already been visited:
            if (visited.has(source[key])) {
                // Set `target[key]` to target stored in the WeakMap
                target[key] = visited.get(source[key])
            } 

            // If `source[key]` has not been visited:
            else {
                // If `target[key]` is not an array:
                if (!Array.isArray(target[key])) {
                    // Set `target[key]` to an empty array
                    target[key] = []
                }
                // Recursively merge nested arrays
                deepMerge(target[key], source[key], visited)
            }
        }

        // If `source[key]` is type `object` and is not null:
        else if (typeof source[key] === "object" && source[key] !== null) {
            // If `source[key]` has already been visited:
            if (visited.has(source[key])) {
                // Set `target[key]` to target stored in the WeakMap
                target[key] = visited.get(source[key])
            } 

            // If `source[key]` has not been visited:
            else {
                // If `target[key]` is non-object or is null:
                if (typeof target[key] !== "object" || target[key] === null) {
                    // Set `target[key]` to an empty object
                    target[key] = {}
                }
                // Recursively merge nested objects
                deepMerge(target[key], source[key], visited)
            }
        } 
        
        // If `source[key]` is primitive value or function:
        else {
            // Set value from source to target
            target[key] = source[key]
        }
    }
}

/*
    Define a subroutine to replace certain values in 
    an object with the result of passing them into a function.
    // TODO: use weak map/set to handle circular references
*/
const mapWithRule = (target, rule, func) => {
    // Iterate over key-value pairs in `rule`
    for (const [key, value] of Object.entries(rule)) {
        /*
            If `value` is true, set `target[key]` to 
            the result of calling `func()` with the 
            current value passed as the first parameter.
            `target[key] = func(target[key])`
            Effectively running `func` on the current value.
        */
        if (value === true) {
            target[key] = func(target[key])

        /*
            If `value` is another object, recurse,
            providing `value` as the nested rule.
        */
        } else if (typeof value === "object" && value !== null) {
            mapWithRule(target[key], value, func)
        }
    }
}
// #endregion



// #region Exports
// Define object to hold all object utils
const objectUtils = {
    deepMerge,
    mapWithRule
}

// Default export for the entire object
export default objectUtils

// Named exports for each method
export { deepMerge, mapWithRule }
// #endregion