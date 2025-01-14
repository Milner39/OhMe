// #region Imports

// Validation
import { zValidator } from "@hono/zod-validator"
import { userRegisterSchema } from "#validation/src/zod-schemas/index.ts"
import { validateJsonHook } from "~db-api/server/src/lib/utils/response-utils.ts"

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

import { registerUser } from "~db-api/db-orm/src/db-ops/user.ts"

import { KnownError } from "#utils/src/error-utils.ts"
import { StandardResponseBody } from "#utils/src/response-utils.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/register")
	// Define methods for this path
	.post(
		"/",
		zValidator("json", userRegisterSchema, validateJsonHook),
		async (ctx) => {
			// Get request body
			const body = ctx.req.valid("json")

			// Register user
			const registerUserResponse = await registerUser({
				user: { username: body.username },
				password: { hash: body.password },
				email: { address: body.email }
			})

			// Check for errors
			if (registerUserResponse.error !== null) {
				// Get error
				const error = registerUserResponse.error


				// Create base response
				const baseBody = {
					result: null,
					error: new KnownError("Error registering user", {
						code: "Unknown server error" ,
					})
				} satisfies StandardResponseBody
				const baseResponse = ctx.json(baseBody, 500)


				// Return failure if error is not a known error
				if (!(KnownError.isKnownError(error))) return baseResponse
				
				// Handle known errors
				switch (error.cause.code) {
					case "UniqueCollision":
						baseBody.error.message = "User already exists"
						baseBody.error.cause = error.cause
						return ctx.json(baseBody, 409)

					default:
						return baseResponse
				}
			}
			// User has registered successfully after here
			
			
			// Get IDs
			const userId = registerUserResponse.result.extendedUser.user.id
			const sessionId = registerUserResponse.result.session.id

			const resBody = {
				result: {
					userId: userId,
					sessionId: sessionId
				},
				error: null
			} satisfies StandardResponseBody

			// Return success
			return ctx.json(resBody, 201)
		}
	)


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	// N/A

	// Mount dynamic routes
	// N/A


// Export router
export default deepRouter