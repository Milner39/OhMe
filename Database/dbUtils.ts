// #region Imports

// Import database tables
import tables from "./drizzle/src/index.ts"

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import dependencies to get environment variables
import dotenv from "dotenv"

// Import all of conditional operators to make type checking easier
import { 
	eq, ne, gt, gte, lt, lte, exists, notExists, isNull, isNotNull, 
	inArray, notInArray, between, notBetween, like, notLike, ilike, notIlike, 
	not, and, or, arrayContains, arrayContained, arrayOverlaps
} from "drizzle-orm"
// It is very frustrating that I cannot import all of these as one object


// Import types
import { Table, Column, InferSelectModel, InferInsertModel } from "drizzle-orm"

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


// Get unique columns
const getUniqueColumns = <T extends Table>(
	table: T
) => {
	/* 
		Keys will always be column names since there is a check in the filter
		to only return values that are columns.
	*/
	// @ts-ignore: reason above 
	const uniqueColumns: {
		[K in keyof InferSelectModel<T>]?: Column
	} = Object.fromEntries(
			Object.entries(table).filter(([_, column]) => {
				if (column instanceof Column) {
					return column.isUnique || column.primary
				}
			}
		)
	)

	return uniqueColumns
}


// Conditional operators
const conditionalOperators = {
	eq, ne, gt, gte, lt, lte, exists, notExists, isNull, isNotNull,
	inArray, notInArray, between, notBetween, like, notLike, ilike, notIlike,
	not, and, or, arrayContains, arrayContained, arrayOverlaps
}

// #endregion Utils



// #region Exports

export {
	getDbCredentials,
	getUniqueColumns,
	conditionalOperators,
	tables
}

// #endregion Exports