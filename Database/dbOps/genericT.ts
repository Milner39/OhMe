// #region Imports

// Import database connection
import db from "../dbConnection.ts"


// Import utils
import {
	getTableColumns,
} from "drizzle-orm"

import {
	conditionalOperators as cOps,
} from "../dbUtils.ts"



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

// Class to make searching the database easier
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
			conditionalOperators: typeof cOps,
		) => SQL | undefined
	) => {
		// @ts-ignore:
		this.query = this.query
			.innerJoin(foreignTable, on(this.columns, cOps))

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

export const gFindMany = async <
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





export const gFindOne = async <
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
			throw new Error("Failed to find one record")
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
				throw new Error("Failed to update one record")
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
				throw new Error("Failed to delete one record")
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

// #endregion Generic Operations