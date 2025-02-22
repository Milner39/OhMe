// #region Imports

import loadEnv from "../../packages/load-env/src"
import { z } from "zod"

// Import parent environment variables
import parentEnv from "../../env"

// #endregion Imports



// Create URL to env file
const envURL = new URL("./.env", import.meta.url)


// Create schema for env vars
const schema = z.object({
	NODE_SERVER_PORT: z.coerce.number().default(3000),
	NODE_SERVER_HOST: z.string().default("0.0.0.0"),
	NODE_SERVER_ORIGIN: z.string().url(),

	DEV_PORT: z.coerce.number().default(2998),
	PREV_PORT: z.coerce.number().default(2999)
})


// Load env
const env = loadEnv(envURL, schema)


// Export env vars
const mergedEnv = { ...parentEnv, ...env }
export default mergedEnv