// #region Imports

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

const userIdCookieName = "user-id"
const sessionIdCookieName = "session-id"


/** setAuthCookies
 * 
 * Gets the cookies needed for authentication.
 */
export const getAuthCookies = (
	cookies: Cookies
) => {
	const userId = cookies.get(userIdCookieName)
	const sessionId = cookies.get(sessionIdCookieName)

	return { userId, sessionId }
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
		path: "/"
	}

	// Delete user ID cookie
	cookies.delete(userIdCookieName, sharedOptions)

	// Delete session ID cookie
	cookies.delete(sessionIdCookieName, sharedOptions)
}

// #endregion Auth Cookies