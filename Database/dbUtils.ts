// deno-lint-ignore-file no-explicit-any

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

// Import utils
import {
	getTableColumns,
} from "drizzle-orm"

import { keepKeys, tsObjectEntries, tsObjectKeys } from "../Utils/objectUtils.ts"


// Import types
import { InferSelectModel } from "drizzle-orm"
import { PgTableWithColumns } from "drizzle-orm/pg-core"

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
const getUniqueColumns = <Table extends PgTableWithColumns<any>>(
	table: Table
) => {
	type Columns = ReturnType<typeof getTableColumns<Table>>

	type UniqueColumns = {
		[Key in keyof Columns]: Columns[Key]["isUnique"] extends true ? 
		Columns[Key] 
		: Columns[Key]["primary"] extends true ? 
			Columns[Key] : 
			never
	}

	
	const columns: Columns = getTableColumns(table)

	const uniqueColumns = Object.fromEntries(
		tsObjectEntries(columns).filter(([_, column]) => {
			return (
				column.isUnique || 
				column.primary
			)
		})
	) as UniqueColumns
	
	return uniqueColumns

	/* WARNING:
		The types returned from this function are incorrect
		There is no way to get only the unique columns from a table type since
		columns are typed like this:
			{
				primary: boolean
				isUnique: boolean
				...
			}

		Rather than like this:
			{
				primary: true
				isUnique: true
				...
			}
	*/
}


// Get keep unique columns rule
const getKeepUniqueColumnsRule = <T extends PgTableWithColumns<any>>(
	table: T
) => {
	const uniqueColumns = getUniqueColumns(table)

	const uniqueColumnNames = tsObjectKeys(uniqueColumns)

	const keepUniqueColumnsEntries = uniqueColumnNames
		.map(columnName => [columnName, true])

	const keepUniqueColumnsRule = (
		Object.fromEntries(keepUniqueColumnsEntries) as
		{ [K in keyof typeof uniqueColumns]: true }
	)

	return keepUniqueColumnsRule
}


// Filter only unique columns
const filterUniqueColumns = <T extends PgTableWithColumns<any>>(
	record: Partial<InferSelectModel<T>>,
	table: T
) => {
	const keepUniqueColumnsRule = getKeepUniqueColumnsRule(table)

	return keepKeys(record, keepUniqueColumnsRule)
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
	getKeepUniqueColumnsRule,
	filterUniqueColumns,
	conditionalOperators,
	tables
}

// #endregion Exports