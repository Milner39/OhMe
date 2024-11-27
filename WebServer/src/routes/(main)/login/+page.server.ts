// #region Imports

// Import types
import type { Actions } from "./$types"

// #endregion Imports



// #region Actions

export const actions = {

	// #region Register
	register: (event) => {
		console.log("Register action ran")
		// TODO register the user
	},
	// #endregion Register

	// #region Login
	login: (event) => {
		console.log("Login action ran")
		// TODO log the user in
	},
	// #endregion Login

} satisfies Actions

// #endregion Actions