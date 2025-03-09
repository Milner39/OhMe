// #region Imports

import { createRouter } from "../lib/create-router"

import userR from "./user"
import transactionR from "./transaction"

// #endregion Imports



// Create base router
const router = createRouter().basePath("/")
	// Define methods for this path
	// N/A


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	.route("/", userR)
	.route("/", transactionR)

	// Mount dynamic routes
	// N/A


// Export base router
export default deepRouter