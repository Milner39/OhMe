// #region Imports

// Import types
import type { Actions } from "./$types"

// #endregion Imports



const dbAPI = "http://localhost:" + (Deno.env.get("DATABASE_API_PORT") || "3001") + "/"



// #region Actions

export const actions = {

	// #region Register
	register: async (event) => {
		const response = await fetch(dbAPI + "user", {
			method: "POST"
		})
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