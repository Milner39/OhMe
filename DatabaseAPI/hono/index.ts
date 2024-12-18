// #region Imports

// Import to get environment variables
import env from "../env.ts"

// Import to create configured Hono app
import { createApp } from "./lib/createApp.ts"

// #endregion Imports



// Create the app
const app = createApp()
	.get("/egg", (c) => {
		return c.json({ egg: "🥚" })
	})

// Serve the app
Deno.serve({
		port: env.DATABASE_API_PORT
	},
	app.fetch
)


export type HonoAppType = typeof app