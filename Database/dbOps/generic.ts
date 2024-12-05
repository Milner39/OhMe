// #region Imports

// Import db connection
import db from "../dbConnection.ts"


// Import types
import type { PgTable } from "drizzle-orm/pg-core"
import { InferSelectModel, InferInsertModel } from "drizzle-orm"

// #endregion Imports



// #region CREATE

export const gCreate = async <T extends PgTable> (
	// The type of `values` is dependent on the table passed in
	table: T,
	values: InferInsertModel<T>,

	// A transaction can be optionally used, and still be type-safe
	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
) => {
	try {
		// Create record
		const record = (await (tx || db).insert(table) // In transaction or db
			.values(values)
			.returning()
		)[0] as InferSelectModel<T> // Infer the type of the record

		return {
			result: record,
			error: null
		}
	}

	catch (error) {
		console.error(error)
		return {
			result: null,
			error: error
		}
	}

	/*
		A generic, type-safe subroutine to:
			- insert given values into a given table.
			- return the inserted record if successful.
			- return an error if unsuccessful.
	*/
}

// #endregion CREATE


// #region READ

export const gRead = async (
	callback: (query: typeof db["query"]) => unknown,

	// A transaction can be optionally used, and still be type-safe
	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
) => {
	try {
		// Read result
		const result = await callback((tx || db).query)

		return {
			result: result,
			error: null
		}
	}

	catch (error) {
		console.error(error)
		return {
			result: null,
			error: error
		}
	}

	/*
		A generic, type-safe subroutine to:
			- takes in a callback subroutine.
			- provides the db or tx query object to the callback.
			- runs the callback.
			- return the found records if successful.
			- return an error if unsuccessful.
	*/
}

// #endregion READ


// #region UPDATE

// #endregion UPDATE


// #region DELETE

// #endregion DELETE