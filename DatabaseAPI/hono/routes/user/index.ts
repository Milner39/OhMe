// #region Imports

import { createRouter } from "../../lib/createRouter.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user")
	// Define methods for this path
	.post("/", (ctx) => {
		return ctx.json({
			message: "Database API received request to create user"
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