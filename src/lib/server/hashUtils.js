// #region Imports

/*
    https://oslo.js.org/reference/password/Argon2id/
    Provides subroutines for hashing and verifying strings
*/
import { Argon2id } from "oslo/password"
// #endregion



// #region stringHasher
// Extend the `Argon2id` class to add `failVerify()` method
class StringHasher extends Argon2id {
    constructor(options) {
        super(options)
    }

    async init() {
        if (this.#isInit) return

        this.#failingHash = await stringHasher.hash("Random Text")
        this.#isInit = true
    }

    /**
     * Simulate the computation time that verifying a string would take.
     
     * Use to prevent timing attacks where malicious clients attempt 
       to guess credentials based on HTTP request response times.
     * @async
     *
     * 
     * @returns {Promise<false>}
     */
    async failVerify() {
        await this.verify(this.#failingHash, "Fail Verification")
        return false
    }

    #failingHash = null
    #isInit = false
}


// Define a object to hold string hashing and verifying subroutines
const stringHasher = new StringHasher({
    memorySize: 65536,//KB
    iterations: 3,
    parallelism: 1,
    tagLength: 32
})
await stringHasher.init()
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