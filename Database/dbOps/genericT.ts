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
	SQL,
} from "drizzle-orm"

// #endregion Imports


class DynamicQuery<
	// deno-lint-ignore no-explicit-any
	Table extends PgTableWithColumns<any>
> {
	// Attributes
	table
	columns
	query


	// Constructor
	constructor(
		table: Table
	) {
		// Store table information
		this.table = table
		this.columns = getTableColumns(this.table)
		this.query = this.#createBaseQuery()
	}


	// Methods
	#createBaseQuery = () => {
		// Create base query to reset to after execution
		return db
			.select()
			.from(this.table)
			.$dynamic()
	}


	filter = (
		filter?: (
			columns: typeof this["columns"],
			conditionalOperators: typeof cOps,
		) => SQL | undefined
	) => {
		this.query = this.query
			.where(filter?.(this.columns, cOps))

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

	execute = async () => {
		const query = this.query
		this.query = this.#createBaseQuery()

		return await query
	}
}


import { tables } from "../dbUtils.ts"
const { user, email } = tables


const query = new DynamicQuery(user)

query
.innerJoin(email, (user, cOps) => cOps.and(
	cOps.eq(user.id, email.userId),
	cOps.eq(email.address, "Molly@example.com")
))

console.log(await query.execute())
//console.log(await query.execute())