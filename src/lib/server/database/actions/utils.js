// #region collapseDBActionDataRecord
/**
 * Collapses a DB action `data` record argument into just the fields,
   removing the action ("update", "create", etc) from relational fields.
   This is useful for making a query for existing entries with the same data
   as what is about to be updated or created.
 *
 *
 * @param {{"": any[]}} data - The data record to collapse.
 * 
 * @returns {{"": any[]}} - The collapsed record.
 * 
 * @example 
    collapseDBActionDataRecord({
        username: "example",
        email: {
            _: { 
                address: "example",
                verifyCode: "example"
            }
        },
        password: {
            _: { hash: "example" }
        }
    })

    // Returns
    {
        username: "example",
        email: {
            address: "example",
            verifyCode: "example"
        },
        password: { hash: "example" }
    }
 */
// TODO: Update tests with isPlainObject check
const collapseDBActionDataRecord = (data) => {
    // TODO: Move to objectUtils.js with tests
    const isPlainObject = (obj) => {
        return Object.prototype.toString.call(obj) === "[object Object]"
    }

    // Throw error if `data` is not plain object
    if (!isPlainObject(data)) {
        throw new Error("`data` must be plain object")
    }

    const collapsedFields = {}

    for (const [key, value] of Object.entries(data)) {
        if (isPlainObject(value)) {
            collapsedFields[key] = collapseDBActionDataRecord(value[Object.keys(value)[0]])
        }

        else {
            collapsedFields[key] = value
        } 
    }

    return collapsedFields
}
// #endregion collapseDBActionDataRecord



// #region Exports

// Define object to hold all utils
const utils = {
    collapseDBActionDataRecord
}

// Default export for entire object
export default utils

// Named exports for each util
export {
    collapseDBActionDataRecord
}

// #endregion Exports