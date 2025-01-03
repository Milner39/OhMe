// #region Imports

import { fail } from "@sveltejs/kit"

import { getFormData } from "$lib/utils/form-action-utils.ts"

import { Validator } from "#validation/src"

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
const dbAPI = createDbApiClient()


// #region Actions

export const actions = {

	// #region Register
	register: async ({ request }) => {

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
			error: {
				username: validateUsername.error,
				email: validateEmail.error,
				password: validatePassword.error
			}
		})

		
		// Inputs are valid, continue
	},
	// #endregion Register

	// #region Login
	login: async ({ request }) => {
		
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


		// Inputs are valid, continue
	},
	// #endregion Login

} satisfies Actions

// #endregion Actions