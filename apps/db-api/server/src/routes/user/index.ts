// #region Imports

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

// Import child routes
import userIdR from "./[userId]/index.ts"

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
	.route("/", userIdR)


// Export router
export default deepRouter