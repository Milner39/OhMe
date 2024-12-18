// #region Imports

import { Hono } from "hono"

import router from "../routes/index.ts"

// #endregion Imports



export const createRouter = () => {
	return new Hono({
		strict: false    // Ignore trailing slashes
	})
}


export const createApp = () => {
	const app = createRouter()

	// Mount router onto app
	app.route("/", router)

	return app
}