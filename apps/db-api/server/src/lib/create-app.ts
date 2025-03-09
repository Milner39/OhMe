// #region Imports

import { createRouter } from "./create-router"
import router from "../routes"

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