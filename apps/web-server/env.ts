// #region Imports

// Import to get environment variables
import dotenv from "dotenv"

// Import to get file paths
import { fileURLToPath, URL } from "node:url"

// Import to validate environment variables
import { z } from "zod"


// Import parent environment variables
import parentEnv from "@/env.ts"

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
const { data: env, error } = envSchema.safeParse(Deno.env.toObject())

if (error) {
	console.error(error)
	Deno.exit(1)
}


// Merge with parent environment variables
const mergedEnv = { ...parentEnv, ...env! }


// Export environment variables and types
export default mergedEnv