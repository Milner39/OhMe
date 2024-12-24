// #region Imports

import { createRouter } from "./createRouter.ts"

// Import to mount router onto app
import router from "../routes/index.ts"

// #endregion Imports



// Subroutine to create main app
export const createApp = () => {
	const app = createRouter()

	// Mount router onto app
	const routedApp = app.route("/", router)

	return routedApp
}