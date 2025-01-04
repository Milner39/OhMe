// #region Imports

// Validation
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { stringToJSON } from "#utils/src/zod-utils.ts"
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
		zValidator(
			"form",
			z.object({
				body: stringToJSON.pipe(userRegisterSchema)
			})
		),
		(ctx) => {
			const { body } = ctx.req.valid("form")

			return ctx.json({
				message: "Database API received request to create user"
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