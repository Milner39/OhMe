// #region Imports

// Validation
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { userRegisterSchema } from "#validation/src/zod-schemas/index.ts"

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

// Import child routes
import userIdR from "./[userId]/index.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user")
	// Define methods for this path
	.post(
		"/",
		zValidator("json", z.object({
			body: userRegisterSchema
		})),
		(ctx) => {
			const { body } = ctx.req.valid("json")

			return ctx.json({
				message: "Database API received request to create user",
				username: body.username,
			})
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