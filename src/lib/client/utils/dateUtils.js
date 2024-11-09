// #region Extras

/**
 * Get a number padded to 2 digits by placing a 0 in the 
   tens column of single digit numbers.
 * 
 * @param {Number} num - The `Number` to pad to 2 digits.
 * 
 * @returns {String}
 */
const padTo2Digits = (num) => {
    return num.toString().padStart(2, "0")
}
// #endregion



// #region Utils
    // #region format()
/**
 * Format a `Date` object into readable a string.
 * 
 * @param {Date} date - The `Date` to format.
 * 
 * @returns {string}
 */
const format = (date) => {
    if (!(date instanceof Date)) {
        throw new Error("`date` must be `Date` object")
    }

    const DD = padTo2Digits(date.getDate())
    const MM = padTo2Digits(date.getMonth() +1)
    const YYYY = date.getFullYear().toString()
    const hh = padTo2Digits(date.getHours())
    const mm = padTo2Digits(date.getMinutes())
    const ss = padTo2Digits(date.getSeconds())
    return [DD, MM, YYYY].join("/") + " " + [hh, mm, ss].join(":")
    // DD/MM/YYYY hh:mm:ss
}
    // #endregion


    // #region dateFromNow()
/**
 * Get `Date` +/- ms from now.
 * 
 * @param {Number} difference - How much time to add from now in ms.
 * 
 * @returns {Date} 
 */
const dateFromNow = (difference) => {
    if (typeof difference !== "number") {
        throw new Error("`difference` must be type `Number`")
    }

    const now = new Date()
    const newTime = new Date(now.getTime() + difference)
    return newTime
}
    // #endregion
// #endregion



// #region Exports
// Define object to hold all date utils
const dateUtils = {
    format,
    dateFromNow
}

// Default export for the entire object
export default dateUtils

// Named exports for each method
export { format, dateFromNow }
// #endregion