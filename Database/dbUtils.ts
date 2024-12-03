// #region Imports

// Import database tables
import tables from "./drizzle/src/index.ts"

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import dependencies to get environment variables
import dotenv from "dotenv"

// #endregion Imports



// Load environment variables
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) })



// #region Utils

// Get db credentials
const getDbCredentials = () => {
	// Get database URL from environment variables
	const dbURLString = Deno.env.get("DATABASE_URL")
		
	// Throw an error if the database URL is not found
	if (!dbURLString) throw new Error(
		"DATABASE_URL environment variable not found"
	)

	// Parse the database URL
	const dbURL = new URL(dbURLString)


	// Return the database credentials
	return {
		user: dbURL.username,					// <username>
		password: dbURL.password,				// <password>
		host: dbURL.hostname,					// <host>
		port: parseInt(dbURL.port),				// <port>
		database: dbURL.pathname.slice(1),		// <databaseName>
		ssl: false // To fix "The server does not support SSL connections"
	}
}

// #endregion Utils



// #region Exports

export {
	getDbCredentials,
	tables
}

// #endregion Exports