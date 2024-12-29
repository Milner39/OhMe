// #region Imports

// Import to get if code is running in the browser or server
import { browser } from "$app/environment"


// Import types
import type { PageLoad } from "./$types"

// #endregion


// #region Load

export const load: PageLoad = ({ url }) => {

	// If not running in browser
	if (!browser) {
		return { mode: "login" } // Return default mode
	}
	

	// Get the `mode` search parameter
	let mode = url.searchParams.get("mode")

	// Define valid modes
	const validModes = new Set([
		"login",
		"register",
		"reset-password"
	])
	/* Use `Set` because:
		- Force unique values
		- Faster lookup than `Array`
	*/

	// Set `mode` to default mode if is not one of the valid options
	mode = validModes.has(mode) ? mode : "login"

	// Return the form mode
	return { mode }
}

// #endregion Load