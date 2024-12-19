// #region Imports

import { createRouter } from "../../../../lib/createRouter.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/session")
	// Define methods for this path
	.get("/", (ctx) => {
        const { userId } = ctx.req.param()

		return ctx.json({
			message: 
				"Database API received request to get session of user of id: " +
				userId
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