// #region Imports

// Import to get db credentials
import { getDbCredentials } from "./dbUtils.ts"

// Import to get environment variables
import env from "../env.ts"


// Import types
import { Config } from "drizzle-kit"

// #endregion Imports



// Define output directory for migration files based on environment
const out = "drizzle/out/" + (!env.TESTING ? "prod" : "test")

// Define Drizzle config
const config = {
	dialect: "postgresql",
	dbCredentials: {
		...getDbCredentials()
	},
	schema: "drizzle/src/**/schema.ts", // The files containing the schemas for each table
	out: out, // The directory to store migration files
	migrations: {
		prefix: "timestamp", // Prefix migration files with a timestamp
	}
} satisfies Config

// Export Drizzle config
export default config


// INFO: Paths are relative to the directory of the process, not this file