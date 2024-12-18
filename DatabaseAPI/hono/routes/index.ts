// #region Imports

import { createRouter } from "../lib/createRouter.ts"

// Import child routes
import user from "./user/index.ts"

// #endregion Imports



// Create base router
const router = createRouter().basePath("/")
	// Define methods for this path
	.get("/", (ctx) => {
		return ctx.json({
			message: "Welcome to the OhMe DB API!"
		})
	})


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	.route("/", user)

	// Mount dynamic routes
	// N/A


// Export base router
export default deepRouter