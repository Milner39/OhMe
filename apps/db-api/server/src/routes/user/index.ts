// #region Imports

// Validation
import { zValidator } from "@hono/zod-validator"
import { userRegisterSchema } from "#validation/src/zod-schemas/index.ts"

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

// Import child routes
import userIdR from "./[userId]/index.ts"


import { registerUser } from "~db-api/db-orm/src/db-ops/user.ts"
import { KnownError } from "~db-api/utils/error-utils.ts"


// Import types
import type { 
	StandardResponseBody
} from "~db-api/server/src/lib/utils/response-utils.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user")
	// Define methods for this path
	.post(
		"/",
		zValidator("json", userRegisterSchema),
		async (ctx) => {
			// Get request body
			const body = ctx.req.valid("json")

			// Create user
			const regUserResponse = await registerUser({
				user: { username: body.username },
				password: { hash: body.password },
				email: { address: body.email },
			})

			// Check for errors
			if (regUserResponse.error !== null) {
				// Get error
				const error = regUserResponse.error


				// Create base response
				const baseBody = {
					result: null,
					error: {
						message: "Error creating user",
						cause: { code: "Unknown server error" },
					}
				} satisfies StandardResponseBody
				const baseResponse = ctx.json(baseBody, 500)


				// Return failure if error is not a known error
				if (!(KnownError.isKnownError(error))) return baseResponse
				
				// Handle known error
				switch (error.cause.code) {
					case "UniqueCollision":
						baseBody.error.cause = error.cause
						return ctx.json(baseBody, 409)

					default:
						return baseResponse
				}
			}

			// User registered successfully
			
			const resBody = {
				result: {
					userId: regUserResponse.result.extendedUser.user.id,
					sessionId: regUserResponse.result.session.id,
				},
				error: null
			} satisfies StandardResponseBody

			// return success
			return ctx.json(resBody, 200)
		}
	)


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	// N/A

	// Mount dynamic routes
	.route("/", userIdR)


// Export router
export default deepRouter