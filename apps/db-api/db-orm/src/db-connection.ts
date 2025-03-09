// #region Imports

import { drizzle } from "drizzle-orm/node-postgres"
import { getDbCredentials } from "./db-utils"
import tables from "./schemas"

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


// Export types
export type DB = typeof db
export type DBTransaction = Parameters<
	Parameters<DB["transaction"]>[0]
>[0]