// #region Imports

import { fail } from "@sveltejs/kit"

import { getFormData } from "$lib/utils/form-action-utils.ts"
import { setAuthCookies } from "$lib/utils/cookie-utils.ts"

import { Validator } from "#validation/src/index.ts"

import {
	createApiClient as createDbApiClient
} from "#db-api-client/src/index.ts"


// Import types
import type { Actions } from "./$types"
import type { RegisterFormData, LoginFormData } from "./.d.ts"

// #endregion Imports



// Initialize validator
const validator = new Validator()

// Create DB API client
const dbAPI = createDbApiClient() as any // Types are not working correctly


// #region Actions

export const actions = {

	// #region Register
	register: async ({ request, cookies }) => {

		// Get form inputs
		const formData = await getFormData(request) as RegisterFormData


		// Validate form inputs
		let validInputs = true

		const validateUsername = validator.username(formData.username)
		if (validateUsername.result === false) validInputs = false

		const validateEmail = validator.email(formData.email)
		if (validateEmail.result === false) validInputs = false

		const validatePassword = validator.password(formData.password)
		if (validatePassword.result === false) validInputs = false


		// Return response early if inputs are invalid
		if (!validInputs) return fail(400, {
			result: null,
			error: {
				username: validateUsername.error,
				email: validateEmail.error,
				password: validatePassword.error
			}
		})


		// Inputs are valid, send request to DB API
		const dbRes = await dbAPI.user.register.$post({
			json: {
				username: formData.username,
				email: formData.email,
				password: formData.password
			}
		})
		
		// Check for errors
		if (!dbRes.ok) {
			// TODO: Handle known errors and return appropriate response
			return fail(500, {
				result: null,
				error: {
					message: "Error creating user",
					cause: { code: "Unknown server error" }
				}
			})
		}
		const dbResJson = await dbRes.json()
		// User has registered successfully after here


		// Get IDs
		const { userId, sessionId } = dbResJson.result

		// Set auth cookies
		setAuthCookies(cookies, userId, sessionId)

		return {

		}
	},
	// #endregion Register

	// #region Login
	login: async ({ request, cookies }) => {
		
		// Get form inputs
		const formData = await getFormData(request) as LoginFormData


		// Validate form inputs
		let validInputs = true

		const validateUsername = validator.username(formData.username)
		if (validateUsername.result === false) validInputs = false

		const validatePassword = validator.password(formData.password)
		if (validatePassword.result === false) validInputs = false


		// Return response early if inputs are invalid
		if (!validInputs) return fail(400, {
			error: {
				username: validateUsername.error,
				password: validatePassword.error
			}
		})


		// Inputs are valid, send request to DB API
		const dbRes = await dbAPI.user["log-in"].$post({
			json: {
				username: formData.username,
				password: formData.password
			}
		})

		// Check for errors
		if (!dbRes.ok) {
			// TODO: Handle known errors and return appropriate response
			return fail(500, {
				result: null,
				error: {
					message: "Error creating user",
					cause: { code: "Unknown server error" }
				}
			})
		}
		const dbResJson = await dbRes.json()
		// User has logged in successfully after here

		// Get IDs
		const { userId, sessionId } = dbResJson.result

		// Set auth cookies
		setAuthCookies(cookies, userId, sessionId)

		return {

		}
	},
	// #endregion Login

} satisfies Actions

// #endregion Actions