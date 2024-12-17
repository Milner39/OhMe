// #region Imports

import { Hono } from "hono"

// Import to get environment variables
import { loadAllDotenvs } from "../allDotenvs.ts"

// #endregion Imports



// Load environment variables
loadAllDotenvs()



// Create the Hono app
const app = new Hono({
	strict: false	// Ignore trailing slashes
})

app.get("/", (c) => {
	return c.json({ message: "Hello, world!" })
})

// Serve the app
Deno.serve({
		port: Number(Deno.env.get("DATABASE_API_PORT")) || 3001
	},
	app.fetch
)