// deno-lint-ignore-file no-explicit-any

// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import utils
import { getTableName } from "drizzle-orm"
import {
	conditionalOperators as cOps,
	filterUniqueColumns
} from "../dbUtils.ts"
import { tsObjectEntries, tsObjectKeys } from "../../Utils/objectUtils.ts"


// Import types
import type { PgTableWithColumns } from "drizzle-orm/pg-core"
import { InferSelectModel, InferInsertModel } from "drizzle-orm"
import type { MatchListLength } from "../../Utils/typeUtils.ts"

// #endregion Imports



// #region CREATE

export const gCreate = async <
	T extends PgTableWithColumns<any>,
	V extends InferInsertModel<T>[],
> (
	table: T,
	values: V,

	// A transaction can be optionally used, and still be type-safe
	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: MatchListLength<V, InferSelectModel<T>>,
		error: null
	} | {
		result: null,
		error: unknown
	}
> => {
	try {
		// Create record
		const record = (await (tx || db).insert(table)
			.values(values)
			.returning()
		) as MatchListLength<V, InferSelectModel<T>>

		return {
			result: record,
			error: null
		}
	}

	catch (error) {
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

export const gRead = async <R>(
	callback: (query: typeof db["query"]) => Promise<R>,

	// A transaction can be optionally used, and still be type-safe
	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{ 
		result: R,
		error: null
	} | {
		result: null,
		error: unknown
	}
> => {
	try {
		// Read result
		const result = await callback((tx || db).query)

		return {
			result: result,
			error: null
		}
	}

	catch (error) {
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

export const gDelete = async <T extends PgTableWithColumns<any>> (
	table: T,
	where: Partial<InferSelectModel<T>>,

	// A transaction can be optionally used, and still be type-safe
	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: InferSelectModel<T>[],
		error: null
	} | {
		result: null,
		error: unknown
	}
> => {
	try {
		// Delete record
		const record = (await (tx || db).delete(table)
			.where(cOps.and(
				...(tsObjectEntries(where)
					.map((column) => {
						if (!column) return

						return cOps.eq(
							table[column[0]],
							column[1]
						)
					})
				)
			))
			.returning()
		) as InferSelectModel<T>[]

		return {
			result: record,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error
		}
	}
}

// #endregion DELETE


// #region MISC

// Find unique collisions
export const gFindUniqueCollisions = async <
	T extends PgTableWithColumns<any>,
	V extends Partial<InferSelectModel<T>>,
> (
	table: T,
	values: V,

	// A transaction can be optionally used, and still be type-safe
	tx?: Parameters<Parameters<typeof db["transaction"]>[0]>[0]
): Promise<
	{
		result: (keyof V | undefined)[],
		error: null
	} | {
		result: null,
		error: unknown
	}
> => {
	try {
		// Reduce values to just ones in unique columns
		const uniqueColumnValues = filterUniqueColumns(values, table)

		// Remove columns with null values since they are not unique
		for (const column of tsObjectKeys(uniqueColumnValues)) {
			if (uniqueColumnValues[column] === null) {
				delete uniqueColumnValues[column]
			}
		}

		// Find records with given unique columns
		const {
			result: records,
			error: rError
		} = await gRead(async (query) => {
			const records = await query[
				getTableName(table)
			].findMany({
				// @ts-ignore:
				where: (record) => cOps.or(
					...(tsObjectEntries(uniqueColumnValues)
						.map((column) => cOps.eq(
							record[column[0]],
							column[1]
						))
					)
				)
			}) as InferSelectModel<T>[]

			return records
		}, tx)

		if (rError) throw new Error("Failed while finding unique collisions")

		
		// Find unique columns that have been taken
		const takenUniqueColumns:
			(keyof Partial<InferSelectModel<T>> | undefined)[] & 
			(keyof typeof uniqueColumnValues | undefined)[] =
			[]
		
		if (records && records.length > 0) {
			for (const column of tsObjectKeys(uniqueColumnValues)) {
				for (const record of records) {
					// @ts-ignore:
					if (record[column] === uniqueColumnValues[column]) {
						takenUniqueColumns.push(column)
					}
				}
			}
		}

		// Return taken unique columns
		return {
			result: takenUniqueColumns,
			error: null
		}
	}

	catch (error) {
		return {
			result: null,
			error: error
		}
	}

	/*
		A generic, type-safe subroutine to:
			- take in values from a record of a table.
			- filter the values down to just contain those of unique columns.
			- finds records from the db with ANY of those column values.
			- iterate through records to find which column values are already taken.
			- return the taken column names if successful.
			- return an error if unsuccessful.
	*/
}

// #endregion MISC