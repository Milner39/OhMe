// #region Imports

// Validation
import { authIdsSchema } from "@/packages/validation/src/zod-schemas"
import { z } from "zod"


// Import types
import type { Cookies } from "@sveltejs/kit"

// #endregion Imports



export type CookieOptions = Parameters<Cookies["set"]>[2]



/** setWithMaxAge
 * 
 * Sets a cookie with the max valid age valid (400 days).
 */
export const setWithMaxAge = (
	cookies: Cookies,
	name: string,
	value: string,
	options: Omit<CookieOptions, "maxAge" | "expires">
) => {
	cookies.set(name, value, {
		...options,
		maxAge: 400 * 24 * 60 * 60
	})
}



// #region Auth Cookies

const userIdCookieName = "userId"
const sessionIdCookieName = "sessionId"


/** setAuthCookies
 * 
 * Gets the cookies needed for authentication.
 */
export const getAuthCookies = (
	cookies: Cookies
): {
	result: z.infer<typeof authIdsSchema>,
	error: null
} | {
	result: null,
	error: z.ZodError
}=> {
	const userId = cookies.get(userIdCookieName)
	const sessionId = cookies.get(sessionIdCookieName)

	const { data: authCookies, error } = authIdsSchema.safeParse({
		userId: userId,
		sessionId: sessionId
	})

	if (error) return {
		result: null,
		error: error
	}

	return {
		result: authCookies,
		error: null
	}
}


/** setAuthCookies
 * 
 * Sets the cookies needed for authentication.
 */
export const setAuthCookies = (
	cookies: Cookies,
	userId: string,
	sessionId: string
) => {

	// Define shared options
	const sharedOptions: Parameters<typeof setWithMaxAge>[3] = {
		path: "/",
		sameSite: "strict",
		secure: false, // Since web server is not using HTTPS
		httpOnly: true
	}

	// Set user ID cookie
	setWithMaxAge(cookies, userIdCookieName, userId, sharedOptions)

	// Set session ID cookie
	setWithMaxAge(cookies, sessionIdCookieName, sessionId, sharedOptions)
}


/** deleteAuthCookies
 * 
 * Deletes the cookies needed for authentication.
 */
export const deleteAuthCookies = (
	cookies: Cookies
) => {

	// Define shared options
	const sharedOptions: Parameters<typeof cookies.delete>[1] = {
		path: "/",
		secure: false, // Since web server is not using HTTPS
	}

	// Delete user ID cookie
	cookies.delete(userIdCookieName, sharedOptions)

	// Delete session ID cookie
	cookies.delete(sessionIdCookieName, sharedOptions)
}

// #endregion Auth Cookies