// #region Imports

import { drizzle } from "drizzle-orm/node-postgres"

// Import to get db credentials
import { getDbCredentials, tables } from "./dbUtils.ts"

// #endregion Imports



// Create a connection to the database
const db = drizzle({
	connection: {
		...getDbCredentials()
	},
	schema: tables
})

// Export the database connection
export default db