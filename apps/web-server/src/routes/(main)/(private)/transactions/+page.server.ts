// #region Imports

import { fail } from "@sveltejs/kit"

import { getFormData } from "$lib/utils/form-action-utils.ts"

import {
	getAuthCookies,
	deleteAuthCookies
} from "$lib/utils/cookie-utils.ts"

import { Validator } from "#validation/src/index.ts"
import { SafeKnownError } from "#utils/src/error-utils.ts"

import {
	createApiClient as createDbApiClient
} from "#db-api-client/src/index.ts"


// Import types
import type { Actions } from "./$types"
import type { CreateTransactionFormData } from "./.d.ts"

import type { SafeResponseBody } from "#utils/src/response-utils.ts"

// #endregion Imports



// Initialize validator
const validator = new Validator()

// Create DB API client
const dbAPI = createDbApiClient() as any // Types are not working correctly


// #region Actions

export const actions = {

	// #region Create
	create: async ({ request, cookies }) => {

		// Get the cookies needed for authentication
		const { result: authCookies, error } = getAuthCookies(cookies)

		// Return response early if cookies are invalid
		if (error) {
			deleteAuthCookies(cookies)
			return fail(401, {
				result: null,
				error: new SafeKnownError("Invalid authentication", {
					code: "InvalidAuth"
				})
			} satisfies SafeResponseBody)
		}

		// Get form inputs
		const formData = await getFormData(request) as CreateTransactionFormData


		// Validate form inputs
		let validInputs = true

		const validateUsername = validator.username(formData.username)
		if (validateUsername.result === false) validInputs = false

		const validateAmount = validator.cost(Number(formData.amount))
		if (validateAmount.result === false) validInputs = false


		// Return response early if inputs are invalid
		if (!validInputs) return fail(400, {
			result: null,
			error: new SafeKnownError("Invalid form inputs", {
				code: "InvalidFormInputs",
				target: {
					amount: validateAmount.error
				}
			})
		} satisfies SafeResponseBody)


		// Inputs are valid, send request to DB API
		const dbRes = await dbAPI.transaction.$post({
			param: authCookies,
			json: {
				username: formData.username,
				amount: formData.amount
			}
		})
		console.log(JSON.stringify(await dbRes.json(), null, 4))
		
		// Check for errors
		if (!dbRes.ok) {
			// TODO: Handle known errors and return appropriate response
			return fail(500, {
				result: null,
				error: new SafeKnownError("Error creating transaction", {
					code: "UnknownServerError"
				})
			} satisfies SafeResponseBody)
		}
		// Transaction has been created successfully after here

		return {
			result: { message: "Created successfully" },
			error: null
		} satisfies SafeResponseBody
	},
	// #endregion Create

} satisfies Actions

// #endregion Actions