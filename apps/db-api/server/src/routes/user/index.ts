// #region Imports

// Validation
import { zValidator } from "@hono/zod-validator"
import { authIdsSchema } from "#validation/src/zod-schemas/index.ts"
import { validateRequestHook } from "~db-api/server/src/lib/utils/response-utils.ts"

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

import { safeRead } from "~db-api/db-orm/src/db-ops/user.ts"

import { KnownError } from "@/packages/utils/src/error-utils.ts";
import { StandardResponseBody } from "#utils/src/response-utils.ts"


// Import child routes
import logInR from "./log-in/index.ts"
import registerR from "./register/index.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user")
	// Define methods for this path
	.get(
		"/",
		zValidator("cookie", authIdsSchema, validateRequestHook),
		async (ctx) => {
			// Get request query params
			const cookie = ctx.req.valid("cookie")

			// Get safe user data using auth ids
			const safeReadRes = await safeRead(cookie.userId, cookie.sessionId)

			// Check for errors
			if (safeReadRes.error !== null) {
				// Get error
				const error = safeReadRes.error


				// Create base response
				const baseBody = {
					result: null,
					error: new KnownError("Error reading safe user data", {
						code: "Unknown server error"
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
			// Safe user data is successfully found after here


			const resBody = {
				result: safeReadRes.result,
				error: null
			} satisfies StandardResponseBody

			// Return success
			return ctx.json(resBody, 200)
		}
	)


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	.route("/", logInR)
	.route("/", registerR)

	// Mount dynamic routes
	// N/A


// Export router
export default deepRouter