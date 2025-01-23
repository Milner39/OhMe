// #region Imports

import { getDbCredentials } from "./src/db-utils"
import env from "~db-api/env"
import { Config } from "drizzle-kit"

// #endregion Imports



// Define output directory for migration files based on environment
const out = "db-orm/out/" + (!env.TESTING ? "prod" : "test")

// Define Drizzle config
const config = {

	// Connection settings
	dialect: "postgresql",
	dbCredentials: {
		...getDbCredentials()
	},

	// The files containing the schemas for each table
	schema: "db-orm/src/schemas/**/schema.ts",

	// The directory to store migration files
	out: out, 
	migrations: {
		prefix: "timestamp", // Prefix migration files with a timestamp
	}

} satisfies Config

// Export Drizzle config
export default config


// INFO: Paths are relative to the directory of the process, not this file