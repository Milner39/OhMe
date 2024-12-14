// #region Imports

import { drizzle } from "drizzle-orm/node-postgres"

// Import to get db credentials and schemas
import { getDbCredentials, tables } from "./dbUtils.ts"

// #endregion Imports



// Create a connection to the database
const testing = Deno.env.get("TESTING") === "true"

const db = (!testing) ?
	drizzle({
		connection: {
			...getDbCredentials()
		},
		schema: tables
	}) :
	drizzle.mock({ schema: tables })



// Export the database connection
export default db