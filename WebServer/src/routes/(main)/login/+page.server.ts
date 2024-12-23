// #region Imports

// Get DB API client
import {
	createApiClient as createDbApiClient
} from "~db/hono/client.ts"


// Import types
import type { Actions } from "./$types"

// #endregion Imports



const dbAPI = createDbApiClient()
dbAPI.user[":userId"].session.$get({ param: { userId: "abc" } })


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