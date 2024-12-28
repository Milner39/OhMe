// #region Imports

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

// Import param schema
import paramSchema from "../params.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/session")
	// Define methods for this path
	.get("/", (ctx) => {
		const {
			data: params,
			error
		} = paramSchema.safeParse(ctx.req.param())

		if (error) {
			console.error(error)
			return ctx.text("Bad request", 400)
		}

		return ctx.json({
			message: 
				"Database API received request to get session of user of id: " +
				params.userId
		})
	})


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	// N/A

	// Mount dynamic routes
	// N/A


// Export router
export default deepRouter