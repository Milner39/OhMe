// #region Imports
import { zValidator } from "@hono/zod-validator"
import { userLoginSchema } from "#validation/src/zod-schemas/index.ts"
import { validateRequestHook } from "~db-api/server/src/lib/utils/response-utils.ts"

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

import { logInUser } from "~db-api/db-orm/src/db-ops/user.ts"

import { KnownError } from "#utils/src/error-utils.ts"
import { StandardResponseBody } from "#utils/src/response-utils.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/log-in")
	// Define methods for this path
	.post(
		"/",
		zValidator("json", userLoginSchema, validateRequestHook),
		async (ctx) => {
			// Get request data
			const body = ctx.req.valid("json")

			// Log in user
			const logInUserRes = await logInUser({
				user: { username: body.username },
				password: { hash: body.password }
			})
			console.log(logInUserRes)

			// Check for errors
			if (logInUserRes.error !== null) {
				// Get error
				const error = logInUserRes.error


				// Create base response
				const baseBody = {
					result: null,
					error: new KnownError("Error logging in user", {
						code: "UnknownServerError"
					})
				} satisfies StandardResponseBody
				const baseResponse = ctx.json(baseBody, 500)


				// Return failure if error is not a known error
				if (!(KnownError.isKnownError(error))) return baseResponse

				// Handle known errors
				switch (error.cause.code) {
					case "FindOneNoResult":
						baseBody.error.message = "No user found"
						baseBody.error.cause = error.cause
						return ctx.json(baseBody, 404)
					
					default:
						return baseResponse
				}
			}
			// User has logged in successfully after here


			// Get IDs
			const { userId, sessionId } = logInUserRes.result

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