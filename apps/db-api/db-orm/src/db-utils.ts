// #region Imports

import env from "~db-api/env"
import {
	eq, ne, gt, gte, lt, lte, exists, notExists, isNull, isNotNull, 
	inArray, notInArray, between, notBetween, like, notLike, ilike, notIlike, 
	not, and, or, arrayContains, arrayContained, arrayOverlaps
} from "drizzle-orm"
import { getTableColumns, InferSelectModel } from "drizzle-orm"
import { PgTableWithColumns, PgColumn } from "drizzle-orm/pg-core"
import { 
	keepKeys, tsObjectEntries, tsObjectFromEntries, tsObjectKeys 
} from "#utils/src/object-utils"

// #endregion Imports



// #region Utils

/** getDbCredentials
 * 
 * Get database credentials from an environment variable.
 */
export const getDbCredentials = () => {
	// Get database URL from environment variables
	const dbURLString = (!env.TESTING) ? 
		env.DATABASE_URL : 
		env.TEST_DATABASE_URL

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


/** ExtractTableConfig
 * 
 * Extract the type of the `TableConfig` of a given table.
 */
export type ExtractTableConfig<Table> = Table extends PgTableWithColumns<
	infer TableConfig
> ? TableConfig : never


/** ExtractColumnConfig
 * 
 * Extract the type of the: 
 * 
 * - `ColumnBaseConfig`
 * - `RuntimeConfig`
 * - `TypeConfig`
 * 
 * of a given column.
 */
export type ExtractColumnConfig<Column> = Column extends PgColumn<
	infer ColumnBaseConfig,
	infer RuntimeConfig,
	infer TypeConfig
> ? {
	"ColumnBaseConfig": ColumnBaseConfig,
	"RuntimeConfig": RuntimeConfig,
	"TypeConfig": TypeConfig
} : never


/** ExtractTableColumnConfigs
 * 
 * Extract the `ColumnBaseConfig` of each column in a given table.
 */
export type ExtractTableColumnConfigs<Table extends PgTableWithColumns<any>> = {
	[Key in keyof ExtractTableConfig<Table>["columns"]]: 
		ExtractColumnConfig<
			ExtractTableConfig<Table>["columns"][Key]
		>["ColumnBaseConfig"]
}


/** ColumnsAreUnique
 * 
 * Get which columns are unique in a given table.
 * 
 * Includes columns created with `.primaryKey()` or `.unique()`.
 */
export type ColumnsAreUnique<Table extends PgTableWithColumns<any>> = {
	[Key in keyof ExtractTableColumnConfigs<Table>]: 
		ExtractTableColumnConfigs<Table>[Key]["isPrimaryKey"] extends true 
		? true 
		// : ExtractTableColumnConfigs<Table>[Key]["isUnique"] extends true
		// ? true
		// WARNING: "isUnique" is not a property yet, so only PKs are included
		: false
}


/** getIfColumnsUnique
 * 
 * Get which columns are unique in a given table.
 * 
 * Includes columns created with `.primaryKey()` or `.unique()`.
 */
export const getIfColumnsUnique = <
	Table extends PgTableWithColumns<any>
> (
	table: Table
): ColumnsAreUnique<Table> => {
	const columns = getTableColumns(table)

	const columnsAreUnique = tsObjectFromEntries(
		tsObjectEntries(columns).map((column) => {
			const [name, config] = column
			return [name, Boolean(
				config.primary ||
				config.isUnique
			)]
		})
	)

	return columnsAreUnique as unknown as ColumnsAreUnique<Table>
}


/** filterUniqueColumns
 * 
 * Filter out non-unique columns from `partialRow` based on the unique columns 
 * of `table`.
 */
export const filterUniqueColumns = <
	Table extends PgTableWithColumns<any>
> (
	partialRow: Partial<InferSelectModel<Table>>,
	table: Table
) => {
	// Remove columns with null values since they are not unique
	const rowWithoutNull = tsObjectFromEntries(
		tsObjectEntries(partialRow as Required<typeof partialRow>)
			.filter((column) => column[1] !== null)
	)

	// Return only the unique columns
	return keepKeys(rowWithoutNull, getIfColumnsUnique(table))
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
export const conditionalOperators = {
	eq, ne, gt, gte, lt, lte, exists, notExists, isNull, isNotNull,
	inArray, notInArray, between, notBetween, like, notLike, ilike, notIlike,
	not, and, or, arrayContains, arrayContained, arrayOverlaps
}

// #endregion Utils