// #region Imports

import loadEnv from "#load-env/src"
import { z } from "zod"

// #endregion Imports



// Create URL to env file
const envURL = new URL("./.env", import.meta.url)


// Create schema for env vars
const schema = z.object({
	DATABASE_API_PORT: z.coerce.number().default(3001)
})


// Load env
const env = loadEnv(envURL, schema)


// Export env vars
export default env