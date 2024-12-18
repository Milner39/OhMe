// #region Imports

// Import to get environment variables
import env from "../env.ts"

// Import to create configured Hono app
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

// Export the type for clients to the API
export type HonoAppType = typeof app