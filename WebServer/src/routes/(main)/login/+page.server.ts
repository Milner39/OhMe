// #region Imports

import { hc } from "hono/client"
import type { HonoAppType } from "../../../../../DatabaseAPI/hono/index.ts"

// Import to get environment variables
import env from "../../../../env.ts"

// Import types
import type { Actions } from "./$types"

// #endregion Imports



const dbAPI = "http://localhost:" + new String(env.DATABASE_API_PORT)
const honoClient = hc<HonoAppType>(dbAPI)


// #region Actions

export const actions = {

	// #region Register
	register: async (event) => {
		const response = await fetch(dbAPI + "/user", {
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