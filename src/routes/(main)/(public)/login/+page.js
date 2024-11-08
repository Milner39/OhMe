// #region Imports
import { browser } from "$app/environment"
// #endregion


// #region load()
/*
    Define load subroutine to:
    - Get the `mode` search parameter.

    - Set `mode` to a default value if it is not one
      of the valid options.

    - Return the `mode`.
*/
/** @type {import("./$types").PageServerLoad} */
export const load = async ({ url }) => {

    // If not running in browser
    if (!browser) {
        return { mode: "login" }
    }
    

    // Get the `mode` search parameter
    let mode = url.searchParams.get("mode")

    // Set `mode` to default value if not one of the valid options
    mode = ["login", "register", "reset"].includes(mode) ? mode : "login"

    // Return the form mode
    return { mode }
}
// #endregion