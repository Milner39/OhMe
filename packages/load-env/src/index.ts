// #region Imports

import * as dotenv from "dotenv"
import { fileURLToPath, URL } from "node:url"
import { z, ZodSchema } from "zod"
import * as process from "node:process"

// #endregion Imports



/** loadEnv
 * 
 * Load an env file in a specified directory or file path.
 * 
 * Use a zod schema to validate `process.env`.
 * 
 * Return the env vars.
 */
export const loadEnv = <
	Schema extends ZodSchema
> (
	envURL: URL,
	schema: Schema
) => {
	// Load environment variables
	dotenv.config({ path: fileURLToPath(envURL) })

	// Parse variables with schema
	const result = schema.safeParse(process.env)
	if (result.success) {
		console.error("Incorrect env options:", result.error)
		process.exit(1)
	}

	// Return parsed values
	return result.data as z.infer<Schema>
}



export default loadEnv