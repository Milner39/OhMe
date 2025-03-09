// #region Imports

import { sequence } from "@sveltejs/kit/hooks"
import type { Handle } from '@sveltejs/kit'

import { getAuthCookies, deleteAuthCookies } from "$lib/utils/cookie-utils"
import {
	createApiClient as createDbApiClient
} from "#db-api-client/src"

// #endregion Imports



// Create DB API client
const dbAPI = createDbApiClient()



// #region Handles

const auth: Handle = async ({ event, resolve }) => {
	// Set user data to null by default
	event.locals.userData = null

	// Get the cookies needed for authentication
	const { result: authCookies, error } = getAuthCookies(event.cookies)
	if (error) {
		deleteAuthCookies(event.cookies)
		return await resolve(event)
	}

	// Get safe user data using user and session IDs
	const dbRes = await dbAPI.user.$get({
		query: {
			userId: authCookies.userId,
			sessionId: authCookies.sessionId
		}
	})

	// Check for errors
	if (!dbRes.ok) {
		deleteAuthCookies(event.cookies)
		return await resolve(event)
	}
	const dbResJson = await dbRes.json()
	// Safe user data is successfully found after here


	// Set user data
	event.locals.userData = dbResJson.result
	return await resolve(event)
}

// #endregion Handles



// Export a sequence of handles
export const handle = sequence(auth)