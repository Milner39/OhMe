// #region Imports
import fs from "fs"
import { deepMerge } from "../utils/objectUtils.js"
// #endregion



// #region Replacer
/*
    Define a replacer subroutine to handle 
    circular references in an object so it 
    can be stringified to JSON.
*/
const replace_handleCircularReference = () => {
    /* 
        Initialise a WeakSet to keep track of 
        which objects have already been seen.
    */
    const seen = new WeakSet()

    // Return a subroutine to alter each key-value pair
    return (key, value) => {
        // If `value` is type `object` and is not null:
        if (typeof value === "object" && value !== null) {
            // If `value` has already been seen:
            if (seen.has(value)) {
                // Return the indicator for a circular reference
                return "[Circular]"
            }
            // Add `value` to the `seen` WeakSet
            seen.add(value)
        }
        // Return `value`
        return value
    }
}

/*
    Define a replacer subroutine to handle 
    functions in an object so it can be 
    stringified to JSON.
*/
const replace_handleFunction = (reviverData = {}) => {
    /* 
        Define an attribute on `reviverData` to hold 
        information necessary to reverse this 
        replacer subroutine.
    */
    reviverData.handleFunction = { functions: [] }
    const functions = reviverData.handleFunction.functions

    // Return a subroutine to alter each key-value pair
    return (key, value) => {
        // If `value` is type `function`:
        if (typeof value === "function") {
            // Add `value` to `functions` 
            functions.push(value)
            // Set `value` to the indicator for a function and its id
            value = `[Function *${functions.length}]`
        }
        // Return `value`
        return value
    }
}

/*
    Define a subroutine to create a single 
    replacer from a sequence of replacers 
    to be ran when stringifying an object.
*/
const createReplacerSequence = (replacers) => {
    // Return a subroutine to alter each key-value pair
    return (key, value) => {
        // Iterate over `replacers`:
        for (const replacer of replacers) {
            // Set `value` to the result of the replacer subroutine
            value = replacer(key, value)
        }
        /* 
            Keys will be removed from the object 
            if `undefined` is returned so check if
            `value` is `undefined`:
        */
        if (value === undefined) {
            // Set `value` to the indicator for `undefined`
            value = "[Undefined]"
        }
        // Return `value`
        return value
    }
}

/*
    Define a subroutine to create and return 
    a configured replacer sequence for stringifying
    an object, along with the reviver data needed 
    to reverse the replacer sequence.

    Reviver data will only be populated AFTER the 
    replacer has been called.
*/
const replacerSequence = () => {
    /* 
        Define object to hold information 
        necessary to reverse the replacers.
    */
    const reviverData = {}

    // Return an object with the replacer and the reviver data
    return {
        replacer: createReplacerSequence([
            replace_handleCircularReference(),
            replace_handleFunction(reviverData)
        ]),
        reviverData
    }
}
// #endregion



// #region Reviver
/*
    Define a reviver subroutine to revert
    the corresponding replacer subroutine.
*/
const revive_handleFunction = (reviverData) => {
    // Get the functions stored in the reviver data
    const revive = reviverData.handleFunction || {}
    const functions = revive.functions || []
    /*
        Define a regex pattern to find indicators
        for functions and extract the id from
        the string.
    */
    const regex = /^\[Function \*(\d+)\]$/

    // Return a subroutine to alter each key-value pair
    return (key, value) => {
        // If `value` is type `string`:
        if (typeof value === "string") {
            // Get match information using `regex`
            const match = value.match(regex)
            // If `value` matches `regex`:
            if (match) {
                /* 
                    Set `value` to the function stored in 
                    `functions` at the position indicated 
                    by the id in the string.
                */
                value = functions[match[1] -1]
                // Function ids begin at one so `-1`
            } 
        }
        // Return `value`
        return value
    }
}


/*
    Define a subroutine to create a single
    reviver from a sequence of revivers
    to be ran when parsing JSON.
*/
const createReviverSequence = (revivers) => {
    // Return a subroutine to alter each key-value pair
    return (key, value) => {
        // Iterate over `revivers`:
        for (const reviver of revivers) {
            // Set `value` to the result of the reviver subroutine
            value = reviver(key, value)
        }
        // Return `value`
        return value
    }
}

/*
    Define a subroutine to create and return
    a configured reviver sequence for parsing
    JSON, using the reviver data passed as an
    argument.
*/
const reviverSequence = (reviverData) => {
    // Return an object with the reviver
    return {
        reviver: createReviverSequence([
            revive_handleFunction(reviverData)
        ])
    }
}
// #endregion



// #region Reviver Data
/*
    Define a subroutine to stringify the 
    reviver data for the main object.
*/
const stringify_reviverData = (reviverData) => {
    // Define the replacer
    const replacer = (key, value) => {
        // If `value` is type `function`:
        if (typeof value === "function") {
            // Get the string representation of `value`
            let funcString = value.toString()

            /*
                Check if `value` is a named function.
                Define a regex to check if the syntax
                of `funcString` indicates that the original
                function was a named function.

                The regex extracts the information needed to 
                reconstruct the function as an arrow function.
            */
            const namedFuncRegex = /^(?:function(\*)?\s+)?(\w+)\s*\(([^)]*)\)\s*\{/
            const namedFuncMatch = funcString.match(namedFuncRegex)
            // If `funcString` matches the regex:
            if (namedFuncMatch) {
                // Get the function args from the match
                const funcArgs = namedFuncMatch[3]

                /* 
                    Get the function body by removing all 
                    of the part of the string that matched 
                    the regex (Everything up until and 
                    including the first "{"") and removing 
                    the last "}".
                */
                const funcBody = funcString.substring(namedFuncMatch[0].length, funcString.length -1)
                // Format the function args and body as an arrow function
                funcString = `(${funcArgs}) => {${funcBody}}`
            }

            // Add the indicator  for a function at the beginning of the string
            value = `[Function] ${funcString}`
        }
        // Return `value`
        return value
    }
    // Return the stringified reviver data
    return JSON.stringify(reviverData, replacer, 4)
}

/*
    Define a subroutine to parse the 
    reviver data for the main object.
*/
const parse_reviverData = (reviverData) => {
    // Define the reviver
    const reviver = (key, value) => {
        // If `value` is type `string`:
        if (typeof value === "string") {
            if (value.startsWith("[Function] ")) {
                // Remove indicator
                value = value.replace(/^\[Function\] /, "")
                // Return new function from `value`
                return new Function("return " + value)()
            }
        }
        // Return `value`
        return value
    }
    // Return the parsed reviver data
    return JSON.parse(reviverData, reviver)
}
// #endregion



// #region Extras
/*
    Define a subroutine to get the path
    to the file containing the reviver data
    based on the path of the file containing
    the main object.
*/
const getReviverDataPath = (path) => {
    return path.replace(/\.json$/, ".reviver.json")
}
// #endregion



// #region Utils
/*
    Define a subroutine to stringify an 
    object into JSON with a custom replacer,
    return the JSON and a object indicating 
    how it should be revived back into an object.
*/
const stringify = (obj) => {
    const { replacer, reviverData } = replacerSequence()
    const json = JSON.stringify(obj, replacer, 4)
    return { json, reviverData }
}

/*
    Define a subroutine to parse JSON
    into an object with a custom reviver,
    then return the object.
*/
const parse = (json, reviverData) => {
    const { reviver } = reviverSequence(reviverData)
    const obj = JSON.parse(json, reviver)
    return obj
}

/*
    Define a subroutine to check if a
    file exists. If it does not, create it.
*/
const createIfNotExists = (path) => {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "{}")
    }
}

/*
    Define a subroutine to return the parsed 
    contents of a JSON file.
*/
const read_createIfNotExists = (path) => {
    // Get path for JSON file that stores reviver data
    const reviverDataPath = getReviverDataPath(path)
    createIfNotExists(reviverDataPath)
    // Read and parse reviver data from reviver JSON file to an object
    const reviverData = parse_reviverData(
        fs.readFileSync(reviverDataPath, { encoding: "utf-8", flag: "r" }) || "{}"
    )

    // Create the main JSON file if it does not exist
    createIfNotExists(path)
    /*
        Read and parse data from main JSON file, 
        providing the reviver data with the 
        information necessary to reverse the 
        stringify subroutine.
    */
    const data = parse(
        fs.readFileSync(path, { encoding: "utf-8", flag: "r" }) || "{}",
        reviverData
    ) 
    return data
}

/*
    Define a subroutine to get the parsed
    contents of a JSON file, update the object,
    then stringify and write it to the JSON file.
*/
const update_createIfNotExists = (path, source) => {
    // Get path for JSON file that stores reviver data
    const reviverDataPath = getReviverDataPath(path)
    createIfNotExists(reviverDataPath)
    // Read and parse reviver data from reviver JSON file to an object
    const currentReviverData = parse_reviverData(
        fs.readFileSync(reviverDataPath, { encoding: "utf-8", flag: "r" }) || "{}"
    )

    // Create the main JSON file if it does not exist
    createIfNotExists(path)
    // Open the file in "r+" mode for reading and writing
    const fd = fs.openSync(path, "r+")
    /* 
        Allocate a buffer to read the file into.
        Set the size of the buffer to the size of the file.
    */
    const buffer = Buffer.alloc(fs.fstatSync(fd).size)

    try {
        // Read the bytes from the file
        const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0)
        // Covert the bytes to the JSON string
        var data = buffer.toString("utf-8", 0, bytesRead) || "{}"
    } catch (error) {
        // Log the error and close the file
        console.error("Error reading file:", error)
        fs.closeSync(fd)
    } 
    // Parse the JSON into an object
    data = parse(data, currentReviverData)

    // Merge the `data` object from the file with `source`
    deepMerge(data, source)

    // Delete the contents of the file
    fs.ftruncateSync(fd, 0)

    // Stringify the object back into JSON
    const { json, reviverData } = stringify(data)
    // Write the JSON to the file
    fs.writeSync(fd, json, 0, "utf-8")
    // Close the file
    fs.closeSync(fd)

    /* 
        Truncate reviver file,
        stringify `reviverData` object to JSON,
        write JSON to the file.
    */
    fs.writeFileSync(
        reviverDataPath,
        stringify_reviverData(reviverData),
        { encoding: "utf-8", flag: "w" }
    )
}
// #endregion



// #region Exports
// Define object to hold all JSON utils
const jsonUtils = {
    stringify,
    parse,
    createIfNotExists,
    read_createIfNotExists,
    update_createIfNotExists
}

// Default export for the entire object
export default jsonUtils

// Named exports for each method
export { stringify, parse, createIfNotExists, read_createIfNotExists, update_createIfNotExists }
// #endregion