// #region Imports

// Import to create base app
import { createRouter } from "./create-router.ts"

// Import to mount router onto app
import router from "../routes/index.ts"

// #endregion Imports



// Create main app
export const createApp = () => {
	const app = createRouter()

	// Mount router onto app
	const routedApp = app.route("/", router)

	return routedApp
}



// Export type of app
export type App = ReturnType<typeof createApp>