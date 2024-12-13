// #region Imports

// Import database connection
import db from "../dbConnection.ts"


// Import utils
import {
	getTableColumns,
} from "drizzle-orm"

import {
	conditionalOperators as cOps,
	filterUniqueColumns
} from "../dbUtils.ts"

import {
	tsObjectEntries,
	tsObjectKeys
} from "../../Utils/objectUtils.ts";


// Import types
import type { 
	PgTableWithColumns,
} from "drizzle-orm/pg-core"

import type {
	InferInsertModel,
	InferSelectModel,
	SQL,
} from "drizzle-orm"

import type {
	NotNull,
	MatchListLength,
} from "../../Utils/typeUtils.ts"

// #endregion Imports





// #region Dynamic Query Class

/** DynamicQuery
 * 
 * Class to make searching the database easier
 * 
 * filter:
 * 	- Filter the query based on the columns of the table.
 * 
 * 
 * innerJoin:
 * 	- Join the table with another table.
 * 	- Filter the query based on the columns of the joined table.
 * 
 * 
 * limit:
 * 	- Limit the number of results returned.
 * 
 * 
 * execute:
 * 	- Execute the query and return the results.
 * 	- Reset the query to its base state.
 */
class DynamicQuery<
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> {
	// Attributes
	table
	columns
	connection
	query


	// Constructor
	constructor(
		table: Table,

		tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
	) {
		// Store table information
		this.table = table
		this.columns = getTableColumns(this.table)

		// Store query information
		this.connection = tx || db
		this.query = this.#createBaseQuery()
	}


	// Methods
	#createBaseQuery = () => {
		// Create base query to reset to after execution
		return this.connection
			.select()
			.from(this.table)
			.$dynamic()
	}


	filter = (
		filter: (
			columns: typeof this["columns"],
			conditionalOperators: typeof cOps,
		) => SQL | undefined
	) => {
		this.query = this.query
			.where(filter(this.columns, cOps))

		return this
	}

	innerJoin = <
		// deno-lint-ignore no-explicit-any
		ForeignTable extends PgTableWithColumns<any>
	> (
		foreignTable: ForeignTable,
		on: (
			columns: typeof this["columns"],
			foreignColumns: ReturnType<typeof getTableColumns<ForeignTable>>,
			conditionalOperators: typeof cOps,
		) => SQL | undefined
	) => {
		// @ts-ignore:
		this.query = this.query
			.innerJoin(foreignTable, on(
				this.columns, 
				getTableColumns(foreignTable),
				cOps
			))

		return this
	}

	limit = (amount: number) => {
		this.query = this.query
			.limit(amount)

		return this
	}

	execute = async () => {
		const query = this.query
		this.query = this.#createBaseQuery()

		return await query
	}
}

// #endregion Dynamic Query Class





// #region Generic Operations

// #region READ

/** gReadMany
 * 
 * Expose a callback with a `DynamicQuery` to the caller and execute the query.
 * 
 * Read many rows in the `table` based on the query.
 */
export const gReadMany = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	query: (dynamicQuery: DynamicQuery<Table>) => DynamicQuery<Table>,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: unknown[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const rows = await query(new DynamicQuery(table, tx))
			.execute()

		return {
			result: rows,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}





/** gReadOne
 * 
 * Expose a callback with a `DynamicQuery` to the caller and execute the query.
 * 
 * Add a limit of 2 to end the query early if more than one row is found.
 * 
 * Read one row in the `table` based on the query, or return an error if the 
 * query was not specific enough and found multiple rows.
 */
export const gReadOne = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	query: (dynamicQuery: DynamicQuery<Table>) => DynamicQuery<Table>,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: unknown,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const rows = await query(new DynamicQuery(table, tx))
			.limit(2)
			.execute()

		if (rows.length !== 1) {
			throw new Error("Failed to read one row")
		}

		return {
			result: rows[0],
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}

// #endregion READ





// #region CREATE

/** gCreate
 * 
 * Create many rows in the `table` based on the `values`.
 */
export const gCreate = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>,
	Values extends InferInsertModel<Table>[],
> (
	table: Table,
	values: Values,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: MatchListLength<Values, InferSelectModel<Table>>,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const rows = (await (tx || db).insert(table)
			.values(values)
			.returning()
		) as MatchListLength<Values, InferSelectModel<Table>>

		return {
			result: rows,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}

// #endregion CREATE





// #region UPDATE

/** gUpadateMany
 * 
 * Update many rows in `table` that match `filter` with `values` as the 
 * new values.
 */
export const gUpdateMany = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	values: Partial<InferInsertModel<Table>>,
	filter?: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: InferSelectModel<Table>[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const rows = await (tx || db).update(table)
			.set(values)
			.where(filter?.(getTableColumns(table), cOps))
			.returning() as 
			InferSelectModel<Table>[]
		
		return {
			result: rows,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}





/** gUpadateOne
 * 
 * Update one row in `table` that matches `filter` with `values` as the 
 * new values.
 * 
 * A transaction is used so that if more than one row gets updated, the
 * transaction is reverted and an error is returned.
 */
export const gUpdateOne = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	values: Partial<InferInsertModel<Table>>,
	filter: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: InferSelectModel<Table>,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const txResult = await (tx || db).transaction(async (checkTx) => {
			const rows = await checkTx.update(table)
				.set(values)
				.where(filter(getTableColumns(table), cOps))
				.returning() as 
				InferSelectModel<Table>[]

			if (rows.length !== 1) {
				throw new Error("Failed to update one row")
			}

			return rows[0]
		})

		
		return {
			result: txResult[0],
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}

// #endregion UPDATE





// #region DELETE

/** gDeleteMany
 * 
 * Delete many rows in `table` that match `filter`.
 */
export const gDeleteMany = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	filter?: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: InferSelectModel<Table>[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const rows = await (tx || db).delete(table)
			.where(filter?.(getTableColumns(table), cOps))
			.returning() as 
			InferSelectModel<Table>[]
		
		return {
			result: rows,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}





/** gDeleteOne
 * 
 * Delete one row in `table` that matches `filter`.
 * 
 * A transaction is used so that if more than one row gets deleted, the
 * transaction is reverted and an error is returned.
 */
export const gDeleteOne = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	filter: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: InferSelectModel<Table>,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const txResult = await (tx || db).transaction(async (checkTx) => {
			const rows = await checkTx.delete(table)
				.where(filter(getTableColumns(table), cOps))
				.returning() as 
				InferSelectModel<Table>[]

			if (rows.length !== 1) {
				throw new Error("Failed to delete one row")
			}

			return rows[0]
		})

		
		return {
			result: txResult[0],
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}

// #endregion DELETE





// #endregion MISC

/** gFindUniqueCollisions
 * 
 * 	- Take in a record containing column names as the key and a value that 
 * 	  is the same type of that column.
 * 
 * 	- Filter the record to only the columns that are unique or are the 
 * 	  primary key.
 * 
 * 	- Query the database for any rows that match one or more of the column 
 * 	  values.
 * 
 * 	- Iterate through the record to check if a column with that value 
 * 	  already exists in the datbase.
 * 
 * 	- Return an array of the collumn names that have been taken.
 */
export const gFindUniqueCollisions = async <
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>,
	Values extends Partial<InferSelectModel<Table>>
> (
	table: Table,
	values: Values,

	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: (keyof Values | undefined)[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Reduce values to just ones in unique columns
		const uniqueColumnValues = filterUniqueColumns(values, table)

		// Return early if no unique columns
		if (tsObjectEntries(uniqueColumnValues).length === 0) return {
			result: [],
			error: null
		}


		// Find rows with any of the unique column values
		const {
			result: rows,
			error: rError
		} = await gReadMany(table, (query) => {
			query.filter((columns, { or, eq}) => or(

				// Add an equality check for each unique column
				...(tsObjectKeys(uniqueColumnValues)
					.map((columnName) => eq(
						columns[columnName],
						uniqueColumnValues[columnName]
					))
				)

				/* 
					The row will be returned if any of the unique
					columns match
				*/
			))

			return query
		}, tx)

		if (rError !== null) {
			throw new Error("Failed to find unique collisions")
		}


		// Explicitly type rows for intellisense
		const typedRows = rows as
			InferSelectModel<Table>[]


		// Find which unique columns have been matched
		const takenUniqueColumns: 
			(keyof Partial<Values> | undefined)[] & 
			(keyof typeof uniqueColumnValues | undefined)[] 
			= []
		
		if (typedRows.length > 0) {
			for (const columnName of tsObjectKeys(uniqueColumnValues)) {
				for (const row of typedRows) {
					// @ts-ignore:
					if (row[columnName] === uniqueColumnValues[columnName]) {
						takenUniqueColumns.push(columnName)
					}
				}
			}
		}
		

		return {
			result: takenUniqueColumns,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error as NotNull
		}
	}
}

// #endregion MISC

// #endregion Generic Operations