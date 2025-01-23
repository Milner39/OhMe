// #region Imports

import * as process from "node:process"
import { fileURLToPath, URL } from "node:url"

import * as dotenv from "dotenv"
import { z } from "zod"

// #endregion Imports



// Load environment variables
dotenv.config({
	path: fileURLToPath(new URL("./.env", import.meta.url))
})


// Create a schema for environment variables
const envSchema = z.object({
	DATABASE_API_PORT: z.coerce.number().default(3001)
})


// Validate environment variables
const { data: env, error } = envSchema.safeParse(process.env)
if (error) {
	console.error("Incorrect env options:", error)
	process.exit(1)
}


// Export environment variables
export default env!