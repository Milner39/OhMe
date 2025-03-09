// #region Imports

import {
	getAuthCookies,
	deleteAuthCookies
} from "$lib/utils/cookie-utils"

import {
	createApiClient as createDbApiClient
} from "#db-api-client/src"


// Import types
import type { LayoutServerLoad } from "./$types"

// #endregion Imports



// Create DB API client
const dbAPI = createDbApiClient()



export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	// Get the cookies needed for authentication
	const { result: authCookies, error } = getAuthCookies(cookies)
	if (error) {
		deleteAuthCookies(cookies)
		return
	}

	// Get transactions
	const dbRes = await dbAPI.transaction.$get({ query: authCookies })
	if (!dbRes.ok) {
		deleteAuthCookies(cookies)
		return
	}
	const dbResJson = await dbRes.json()

	// Return transactions
	return {
		transactions: dbResJson.result
	}
}