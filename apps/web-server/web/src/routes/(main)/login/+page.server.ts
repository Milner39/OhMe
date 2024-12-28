// #region Imports

// Get DB API client
import {
	createApiClient as createDbApiClient
} from "#db-api-client/src/index.ts"


// Import types
import type { Actions } from "./$types"

// #endregion Imports



// Create DB API client
const dbAPI = createDbApiClient()


// #region Actions

export const actions = {

	// #region Register
	register: async (event) => {
		const response = await dbAPI.user.$post()
		console.log(response)

		const body = await response.json()
		console.log(body)
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