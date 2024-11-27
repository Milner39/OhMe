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
		return { mode: "login" }
	}
	

	// Get the `mode` search parameter
	let mode = url.searchParams.get("mode")

	// Define valid modes
	const validModes = new Set(["login", "register", "reset-password"])

	// Set `mode` to default value if not one of the valid options
	mode = validModes.has(mode) ? (mode as "login" | "register") : "login"

	// Return the form mode
	return { mode }
}

// #endregion Load