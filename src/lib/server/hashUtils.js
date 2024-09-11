// #region Imports
/*
    https://oslo.js.org/reference/password/Argon2id/
    Provides subroutines for hashing and verifying strings
*/
import { Argon2id } from "oslo/password"
// #endregion



// #region Utils
// Define a object to hold string hashing and verifying subroutines
const stringHasher = new Argon2id({
    memorySize: 65536,//KB
    iterations: 3,
    parallelism: 1,
    tagLength: 32
})

/* 
    Define a subroutine that will simulate the computation time 
    that verifying a string would take. 
    Use to prevent timing attacks where malicious clients attempt 
    to guess credentials based on HTTP request response times.
*/
const failingHash = await stringHasher.hash("Random Text")
stringHasher.failVerify = async () => {
    await stringHasher.verify(failingHash, "Fail Verification")
    return false
}
// #endregion


// #region Exports
// Define object to hold all hash utils
const hashUtils = {
    stringHasher
}

// Default export for the entire object
export default hashUtils

// Named exports for each method
export { stringHasher }
// #endregion



// #region DOCS

// Resources explaining safe password storage
// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

// #endregion