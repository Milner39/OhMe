// #region Imports

// Import to get environment variables
import dotenv from "dotenv"

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import to validate environment variables
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
const { data: env, error } = envSchema.safeParse(Deno.env.toObject())

if (error) {
	console.error(error)
	Deno.exit(1)
}

// Export environment variables
export default env!