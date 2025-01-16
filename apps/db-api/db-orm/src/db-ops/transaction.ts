// #region Imports

import { z } from "zod"

// Import generic CRUD operations
import { 
	gCreate,
	// gReadMany,
	// gReadOne,
	// gUpdateMany,
	// gUpdateOne,
	// gDeleteMany,
	// gDeleteOne,
	// gFindUniqueCollisions
} from "./generic.ts"

// Import tables and schemas
import tables, { zodTableSchemas } from "../schemas/index.ts"
import { authIdsSchema } from "#validation/src/zod-schemas/index.ts"


// Import types
import {
	NotNull,
	asLiteralArray
} from "#utils/src/type-utils.ts"

// #endregion Imports



// #region CREATE

// Get tables used in this file
const { 
	transaction: transactionT,
} = tables


// Define Zod schemas
const createFullTransactionRowSchema = z.object({
	user: zodTableSchemas.user.select.pick({ id: true }),
	transaction: zodTableSchemas.transaction.pureInsert,
})

const safeCreateTransactionRowSchema = z.object({
	auth: authIdsSchema,
	transaction: zodTableSchemas.transaction.pureInsert,
})


// Define types
export type SelectTransaction = z.infer<typeof zodTableSchemas.transaction.select>


/** create
 * 
 * Create a row in `transactionT`.
 */
export const create = async (
	values: z.infer<typeof createFullTransactionRowSchema>
): Promise<
	{
		result: SelectTransaction,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Create transaction
		const {
			result: rows,
			error: cError
		} = await gCreate(transactionT, asLiteralArray({
			userId: values.user.id,
			...values.transaction
		}))
		if (cError !== null) throw cError

		const row = zodTableSchemas.transaction.select.parse(rows[0])

		// Return created rows
		return {
			result: row,
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


// #region Common Operations

import { safeCheckAuth } from "./session.ts"

/** safeCreate
 * 
 * Check if a session and user exist, using the provided auth IDs.
 * Create a row in `transactionT`.
 */
export const safeCreate = async (
	values: z.infer<typeof safeCreateTransactionRowSchema>
): Promise<
	{
		result: z.infer<typeof zodTableSchemas.transaction.safeSelect>,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Check if auth is correct
		const {
			result: authRes,
			error: authError
		} = await safeCheckAuth(values.auth)
		if (!authRes || authError !== null) throw authError

		// Create transaction
		const {
			result: row,
			error: cError
		} = await create({
			user: { id: values.auth.userId },
			transaction: values.transaction
		})
		if (cError !== null) throw cError


		// Parse the non-sensitive information
		const safeRow = zodTableSchemas.transaction.safeSelect.parse(row)

		return {
			result: safeRow,
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
// #endregion Common Operations