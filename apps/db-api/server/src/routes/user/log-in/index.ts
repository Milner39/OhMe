// #region Imports

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/log-in")
	// Define methods for this path
	// N/A


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	// N/A

	// Mount dynamic routes
	// N/A


// Export router
export default deepRouter