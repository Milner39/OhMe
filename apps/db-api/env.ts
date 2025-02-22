// #region Imports

import loadEnv from "#load-env/src"
import { z } from "zod"

// Import parent environment variables
import parentEnv from "@/env"

// #endregion Imports



// Create URL to env file
const envURL = new URL("./.env", import.meta.url)


// Create schema for env vars
const prodS = z.object({
	TESTING: z.literal(false).default(false),

	DATABASE_URL: z.string().url(),
	TEST_DATABASE_URL: z.string().url().optional()
})
const testS = prodS.extend({
	TESTING: z.literal(true),
	TEST_DATABASE_URL: z.string().url()
})
const schema = z.discriminatedUnion("TESTING", [testS, prodS])


// Load env
const env = loadEnv(envURL, schema)


// Export env vars
const mergedEnv = { ...parentEnv, ...env }
export default mergedEnv