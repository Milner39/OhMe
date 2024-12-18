// #region Imports

// Import to get environment variables
import { loadAllDotenvs } from "../allDotenvs.ts"

// Import to create configured Hono app
import { createApp } from "./lib/createApp.ts"

// #endregion Imports



// Load environment variables
loadAllDotenvs()

// Create the app
const app = createApp()

// Serve the app
Deno.serve({
		port: Number(Deno.env.get("DATABASE_API_PORT")) || 3001
	},
	app.fetch
)