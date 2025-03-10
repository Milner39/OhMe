// #region Imports

import { getTableColumns, SQL, InferSelectModel, InferInsertModel } from "drizzle-orm"
import { PgTableWithColumns } from "drizzle-orm/pg-core"
import db, { DBTransaction } from "../db-connection"
import { conditionalOperators as cOps, filterUniqueColumns } from "../db-utils"
import { tsObjectEntries, tsObjectKeys } from "#utils/src/object-utils"
import { NotNull, MatchListLength, PartialKeysTrue } from "#utils/src/type-utils"
import { AnyKnownError, KnownError } from "#errors/src"
import { DBORMQueryBadExecutionError, QueryOneFoundManyError, 
QueryOneFoundNoneError } from "#errors/src/apps/db-api"

// #endregion Imports



export type QueryType = "create" | "read" | "update" | "delete"

const fallbackQueryErrorIfUnknown = (
	error: unknown,
	queryType: QueryType
): AnyKnownError => {
	if (error instanceof KnownError) return error
	
	return new DBORMQueryBadExecutionError({
		queryType: queryType,
		error: error as NotNull
	})
}



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

		tx?: DBTransaction
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
			// NOTE: TS bug, downgrade to drizzle-orm@0.38.0 or wait for fix
			// Type is not assignable to parameter of type: `TableLikeHasEmptySelection...`
			// @ts-ignore
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
			// Type is not assignable to parameter of type: `TableLikeHasEmptySelection...`
			// @ts-ignore
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
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	query: (dynamicQuery: DynamicQuery<Table>) => DynamicQuery<Table>,

	tx?: DBTransaction
): Promise<
	{
		result: unknown[],
		error: null
	} | {
		result: null,
		error: AnyKnownError
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
			error: fallbackQueryErrorIfUnknown(error, "read")
		}
	}
}





/** gReadOne
 * 
 * Expose a callback with a `DynamicQuery` to the caller and execute the query.
 * 
 * Add a limit of 2 to end the query early if more than 2 rows are found.
 * 
 * Return one row in the `table` based on the query, or return an error if the 
 * query was not specific enough and found multiple rows.
 */
export const gReadOne = async <
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	query: (dynamicQuery: DynamicQuery<Table>) => DynamicQuery<Table>,

	tx?: DBTransaction
): Promise<
	{
		result: unknown,
		error: null
	} | {
		result: null,
		error: AnyKnownError
	}
> => {
	try {
		const rows = await query(new DynamicQuery(table, tx))
			.limit(2)
			.execute()

		if (rows.length === 0) throw new QueryOneFoundNoneError(null)

		if (rows.length > 1) throw new QueryOneFoundManyError(null)

		return {
			result: rows[0],
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: fallbackQueryErrorIfUnknown(error, "read")
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
	Table extends PgTableWithColumns<any>,
	Values extends InferInsertModel<Table>[],
> (
	table: Table,
	values: Values,

	tx?: DBTransaction
): Promise<
	{
		result: MatchListLength<Values, InferSelectModel<Table>>,
		error: null
	} | {
		result: null,
		error: AnyKnownError
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
		// TODO: Specific error for unique collision

		return {
			result: null,
			error: fallbackQueryErrorIfUnknown(error, "create")
		}
	}
}

// #endregion CREATE





// #region UPDATE

/** gUpdateMany
 * 
 * Update many rows in `table` that match `filter` with `values` as the 
 * new values.
 */
export const gUpdateMany = async <
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	values: Partial<InferInsertModel<Table>>,
	filter?: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: DBTransaction
): Promise<
	{
		result: InferSelectModel<Table>[],
		error: null
	} | {
		result: null,
		error: AnyKnownError
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
			error: fallbackQueryErrorIfUnknown(error, "update")
		}
	}
}





/** gUpdateOne
 * 
 * Update one row in `table` that matches `filter` with `values` as the 
 * new values.
 * 
 * A transaction is used so that if more than one row gets updated, the
 * transaction is reverted and an error is returned.
 */
export const gUpdateOne = async <
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	values: Partial<InferInsertModel<Table>>,
	filter: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: DBTransaction
): Promise<
	{
		result: InferSelectModel<Table>,
		error: null
	} | {
		result: null,
		error: AnyKnownError
	}
> => {
	try {
		const txResult = await (tx || db).transaction(async (checkTx) => {
			const rows = await checkTx.update(table)
				.set(values)
				.where(filter(getTableColumns(table), cOps))
				.returning() as 
				InferSelectModel<Table>[]

			if (rows.length === 0) throw new QueryOneFoundNoneError(null)

			if (rows.length > 1) throw new QueryOneFoundManyError(null)

			return rows[0]
		})

		
		return {
			result: txResult,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: fallbackQueryErrorIfUnknown(error, "update")
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
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	filter?: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: DBTransaction
): Promise<
	{
		result: InferSelectModel<Table>[],
		error: null
	} | {
		result: null,
		error: AnyKnownError
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
			error: fallbackQueryErrorIfUnknown(error, "delete")
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
	Table extends PgTableWithColumns<any>
> (
	table: Table,
	filter: (
		columns: ReturnType<typeof getTableColumns<Table>>,
		conditionalOperators: typeof cOps
	) => SQL | undefined,

	tx?: DBTransaction
): Promise<
	{
		result: InferSelectModel<Table>,
		error: null
	} | {
		result: null,
		error: AnyKnownError
	}
> => {
	try {
		const txResult = await (tx || db).transaction(async (checkTx) => {
			const rows = await checkTx.delete(table)
				.where(filter(getTableColumns(table), cOps))
				.returning() as 
				InferSelectModel<Table>[]

			if (rows.length === 0) throw new QueryOneFoundNoneError(null)

			if (rows.length > 1) throw new QueryOneFoundManyError(null)

			return rows[0]
		})

		
		return {
			result: txResult,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: fallbackQueryErrorIfUnknown(error, "delete")
		}
	}
}

// #endregion DELETE





// #region MISC

/** gFindUniqueCollisions
 * 
 * 	- Take in a partial row of `table`.
 * 
 * 	- Filter the row to only the columns that are unique or the primary key.
 * 
 * 	- Query the database for all rows that match any of the column values.
 * 
 * 	- Iterate through the unique columns, and check each returned row, until a
 * 	  row with the same column value is found.
 * 
 * 	- Return a record of the unique column names that have been taken.
 */
export const gFindUniqueCollisions = async <
	Table extends PgTableWithColumns<any>,
	Values extends Partial<InferSelectModel<Table>>
> (
	table: Table,
	values: Values,

	tx?: DBTransaction
): Promise<
	{
		result: PartialKeysTrue<Values>, 
		error: null
	} | {
		result: null,
		error: AnyKnownError
	}
> => {
	try {
		// Reduce values to just ones in unique columns
		const uniqueColumnValues = filterUniqueColumns(values, table)

		// Return early if no unique columns
		if (tsObjectEntries(uniqueColumnValues).length === 0) return {
			result: {},
			error: null
		}


		// Find rows with any of the unique column values
		const {
			result: rows,
			error: rError
		} = await gReadMany(table, (query) => {
			/*
				Filter starts with `or` so if any of the conditions match, the 
				row will be returned
			*/
			return query.filter((columns, { or, eq }) => or(
				// Add an equality check for each unique column
				...(tsObjectKeys(uniqueColumnValues)
					.map((columnName) => eq(
						columns[columnName],
						uniqueColumnValues[columnName]
					))
				)
			))
			/* 
				The row will be returned if any of the unique
				columns match
			*/
		}, tx)

		if (rError !== null) throw rError


		// Explicitly type rows for intellisense
		const typedRows = rows as InferSelectModel<Table>[]


		// Find which unique columns have been matched
		const takenUniqueColumns: 
			PartialKeysTrue<Values> & 
			PartialKeysTrue<typeof uniqueColumnValues>
			= {}
		
		if (typedRows.length > 0) {
			for (const columnName of tsObjectKeys(uniqueColumnValues)) {
				for (const row of typedRows) {
					// @ts-ignore:
					if (row[columnName] === uniqueColumnValues[columnName]) {
						// @ts-ignore:
						takenUniqueColumns[columnName] = true
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
			error: fallbackQueryErrorIfUnknown(error, "update")
		}
	}
}

// #endregion MISC

// #endregion Generic Operations