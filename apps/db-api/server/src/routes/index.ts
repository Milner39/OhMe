// #region Imports

import { createRouter } from "../lib/create-router.ts"

// Import child routes
import userR from "./user/index.ts"

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
	.route("/", userR)

	// Mount dynamic routes
	// N/A


// Export base router
export default deepRouter