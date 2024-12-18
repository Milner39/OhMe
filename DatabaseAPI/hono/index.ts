// #region Imports

// Import to get environment variables
import env from "../env.ts"

// Create configured Hono app
import { createApp } from "./lib/createApp.ts"

// #endregion Imports



// Create the app
const app = createApp()

// Serve the app
Deno.serve({
		port: env.DATABASE_API_PORT
	},
	app.fetch
)