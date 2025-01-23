// #region Imports

import { createRouter } from "~db-api/server/src/lib/create-router"
import { zValidator } from "@hono/zod-validator"
import { validateRequestHook } from "~db-api/server/src/lib/utils/response-utils"
import { authIdsSchema } from "#validation/src/zod-schemas/index"
import { safeRead } from "~db-api/db-orm/src/db-ops/user"
import { KnownError } from "@/packages/utils/src/error-utils"
import { StandardResponseBody } from "#utils/src/response-utils"

import logInR from "./log-in/index"
import registerR from "./register/index"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user")
	// Define methods for this path
	.get(
		"/",
		zValidator("query", authIdsSchema, validateRequestHook),
		async (ctx) => {
			// Get request data
			const queries = ctx.req.valid("query")

			// Get safe user data using auth ids
			const safeReadRes = await safeRead(queries)

			// Check for errors
			if (safeReadRes.error !== null) {
				// Get error
				const error = safeReadRes.error


				// Create base response
				const baseBody = {
					result: null,
					error: new KnownError("Error reading safe user data", {
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