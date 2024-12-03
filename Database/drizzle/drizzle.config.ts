// #region Imports

// Import to get db credentials
import { getDbCredentials } from "../dbUtils.ts"


// Import types
import { Config } from "drizzle-kit"

// #endregion Imports



// Define Drizzle config
const config = {
	dialect: "postgresql",
	dbCredentials: {
		...getDbCredentials()
	},
	schema: "drizzle/src/**/schema.ts", // The files containing the schemas for each table
	out: "drizzle/out", // The directory to store migration files
	migrations: {
		prefix: "timestamp", 
	}
} satisfies Config

// Export Drizzle config
export default config


// INFO: Paths are relative to the directory of the process