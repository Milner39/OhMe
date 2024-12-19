// #region Imports

import { createRouter } from "../../../lib/createRouter.ts"

// Import child routes
import sessionR from "./session/index.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/:userId")
	// Define methods for this path
	.get("/", (ctx) => {
        const { userId } = ctx.req.param()

		return ctx.json({
			message: 
                "Database API received request to get user of id: " +
                userId
		})
	})


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	.route("/", sessionR)

	// Mount dynamic routes
	// N/A


// Export router
export default deepRouter