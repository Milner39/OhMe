// deno-lint-ignore-file no-explicit-any

// #region Imports

import env from "~db-api/env"
import {
	eq, ne, gt, gte, lt, lte, exists, notExists, isNull, isNotNull, 
	inArray, notInArray, between, notBetween, like, notLike, ilike, notIlike, 
	not, and, or, arrayContains, arrayContained, arrayOverlaps
} from "drizzle-orm"
import { getTableColumns, InferSelectModel } from "drizzle-orm"
import { PgTableWithColumns } from "drizzle-orm/pg-core"
import { keepKeys,tsObjectEntries, tsObjectKeys } from "#utils/src/object-utils"

// #endregion Imports



// #region Utils

/** getDbCredentials
 * 
 * Get database credentials from an environment variable.
 */
const getDbCredentials = () => {
	// Get database URL from environment variables
	const dbURLString = (!env.TESTING) ? 
		env.DATABASE_URL : 
		env.TEST_DATABASE_URL as string    // Is string when TESTING is true

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


/** getUniqueColumns
 * 
 * Get the unique columns of `table`.
 * 
 * Unique columns are columns that are either primary keys or have a unique 
 * constraint.
 */
const getUniqueColumns = <
	Table extends PgTableWithColumns<any>
> (
	table: Table
) => {
	type Columns = ReturnType<typeof getTableColumns<Table>>

	type UniqueColumns = {
		[Key in keyof Columns]: Columns[Key]["isUnique"] extends true ? 
		Columns[Key] : 
		Columns[Key]["primary"] extends true ? 
			Columns[Key] : 
			never
	}

	
	const columns: Columns = getTableColumns(table)

	const uniqueColumns = Object.fromEntries(
		// Filter columns by unique constraint or primary key
		tsObjectEntries(columns).filter(([_, column]) => {
			return (
				column.isUnique || 
				column.primary
			)
		})
	) as UniqueColumns
	
	return uniqueColumns

	/* WARNING:
		The types returned from this function are incorrect.
		There is no way to infer the type of only the unique columns from a 
		table type since columns are typed like this:
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

		The subroutine works as expected, but the types are not accurate.
	*/
}


/** getKeepUniqueColumnsRule
 * 
 * Get a rule to keep only the unique columns of `table`.
 * 
 * This rule should be used with `keepKeys` to filter out non-unique columns 
 * from of `table`.
 */
const getKeepUniqueColumnsRule = <
	Table extends PgTableWithColumns<any>
> (
	table: Table
) => {
	const uniqueColumns = getUniqueColumns(table)

	const uniqueColumnNames = tsObjectKeys(uniqueColumns)

	const keepUniqueColumnsEntries = uniqueColumnNames
		.map(columnName => [columnName, true])

	// Create an object with columns names as the keys and `true` as the values
	const keepUniqueColumnsRule = (
		Object.fromEntries(keepUniqueColumnsEntries) as
		{ [Key in keyof typeof uniqueColumns]: true }
	)

	return keepUniqueColumnsRule
}


/** filterUniqueColumns
 * 
 * Filter out non-unique columns from `partialRow` based on the unique columns 
 * of `table`.
 */
const filterUniqueColumns = <
	Table extends PgTableWithColumns<any>
> (
	partialRow: Partial<InferSelectModel<Table>>,
	table: Table
) => {
	const keepUniqueColumnsRule = getKeepUniqueColumnsRule(table)

	// Remove columns with null values since they are not unique
	const recordWithoutNull = Object.fromEntries(
		// @ts-ignore:
		tsObjectEntries(partialRow).filter(([_, value]) => {
			return value !== null
		})
	)

	// Return only the unique columns of `partialRow`
	return keepKeys(recordWithoutNull, keepUniqueColumnsRule)
}


/** conditionalOperators
 * 
 * Functions that can be used to make checks between row values and target 
 * values when querying the database.
 * 
 * @example
 * // Returns true for all rows in the user table where the age column is >=18
 * gte(user.age, 18)
 * 
 * See Drizzle documentation for more information on individual operations.
 */
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
	conditionalOperators
}

// #endregion Exports