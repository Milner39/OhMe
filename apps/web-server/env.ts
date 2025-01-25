// #region Imports

import * as process from "node:process"
import { fileURLToPath, URL } from "node:url"

import * as dotenv from "dotenv"
import { z } from "zod"


// Import parent environment variables
import parentEnv from "../../env"

// #endregion Imports



// Load environment variables
dotenv.config({
	path: fileURLToPath(new URL("./.env", import.meta.url))
})


// Create a schema for environment variables
const envSchema = z.object({
	NODE_SERVER_PORT: z.coerce.number().default(3000),
	NODE_SERVER_HOST: z.string().default("0.0.0.0"),
	NODE_SERVER_ORIGIN: z.string().url(),

	DEV_PORT: z.coerce.number().default(2998),
	PREV_PORT: z.coerce.number().default(2999)
})


// Validate environment variables
const { data: env, error } = envSchema.safeParse(process.env)
if (error) {
	console.error("Incorrect env options:", error)
	process.exit(1)
}


// Merge with parent environment variables
const mergedEnv = { ...parentEnv, ...env! }

// Export environment variables and types
export default mergedEnv