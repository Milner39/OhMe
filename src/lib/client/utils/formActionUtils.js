// #region getFormData
/**
 * Get an `Object` containing a key for each input 
   in a form submission and their respective values.
 *
 * @async
 *
 * @param {
        import("@sveltejs/kit").RequestEvent["request"]
    } request - The request to get form data from.
 *
 * @returns {Promise<{
        "": any[]
    }>}
 */
const getFormData = async (request) => {
    return Object.fromEntries(await request.formData())
}
// #endregion



// #region Exports
// Define object to hold all utils
const utils = {
    getFormData
}

// Default export for the entire object
export default utils

// Named exports for each method
export { 
    getFormData
}
// #endregion