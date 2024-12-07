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
	type ColumnNames = keyof InferSelectModel<T> extends keyof T ?
		keyof InferSelectModel<T> : never

	type UniqueColumns = {
		[Key in ColumnNames]: T[Key] extends Column ? 
		(
			T[Key]["isUnique"] extends true ? 
			T[Key] : (
				T[Key]["primary"] extends true ? 
				T[Key] : never
			)
		) : never
	}


	const uniqueColumns = Object.fromEntries(
			Object.entries(table).filter(([_, column]) => {
				return (
					column instanceof Column &&
					(column.isUnique|| column.primary)
				)
			}) as [keyof UniqueColumns, Column][]
		) as UniqueColumns
	
	return uniqueColumns

	/* 
		The types returned from this function are incorrect
		- Read documentation
		- Ask for help online
	*/
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