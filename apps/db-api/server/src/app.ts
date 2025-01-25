// #region Imports

import env from "~db-api/env"
import { serve } from "@hono/node-server"
import { createApp } from "./lib/create-app"

// #endregion Imports



// Create the app
const app = createApp()

// Serve the app
serve(
	{ port: env.DATABASE_API_PORT, fetch: app.fetch},
	(info) => {
		console.info(`Listening on http://localhost:${info.port}`)
	}
)