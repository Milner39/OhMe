// #region Extras
/*
    Define a subroutine to place a 0 in the 
    tens column of single digit numbers.
*/
const padTo2Digits = (num) => {
    return num.toString().padStart(2, "0")
}
// #endregion



// #region Utils
// Define a subroutine to format a `Date` object
const format = (date) => {
    if (!(date instanceof Date)) {
        throw new Error("'date' must be 'Date' object")
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



// #region Exports
// Define object to hold all date utils
const dateUtils = {
    format
}

// Default export for the entire object
export default dateUtils

// Named exports for each method
export { format }
// #endregion