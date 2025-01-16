// #region Imports

import { z } from "zod"

// Import generic CRUD operations
import { 
	gCreate,
	// gReadMany,
	gReadOne,
	// gUpdateMany,
	// gUpdateOne,
	// gDeleteMany,
	// gDeleteOne,
	// gFindUniqueCollisions
} from "./generic.ts"

// Import utils
import {
	getTableColumns,
} from "drizzle-orm"
import { 
	conditionalOperators as cOps,
} from "../db-utils.ts"

// Import tables and schemas
import tables, { zodTableSchemas } from "../schemas/index.ts"
import { authIdsSchema } from "#validation/src/zod-schemas/index.ts"

import { KnownError } from "@/packages/utils/src/error-utils.ts"


// Import types
import type { DBTransaction } from "../db-connection.ts"

import type { SQL } from "drizzle-orm"

import {
	NotNull,
	asLiteralArray
} from "#utils/src/type-utils.ts"

// #endregion Imports



// Get tables used in this file
const { 
	session: sessionT,
	user: userT
} = tables


// Define Zod schemas
const selectFullSessionRowSchema = z.object({
	user: zodTableSchemas.user.select,
	session: zodTableSchemas.session.select
})

const createFullSessionRowSchema = z.object({
	user: zodTableSchemas.user.select.pick({ id: true }),
	session: zodTableSchemas.session.pureInsert,
})


// Define types
type SelectSession = z.infer<typeof zodTableSchemas.session.select>
type selectFullSessionRow = z.infer<typeof selectFullSessionRowSchema>

export type SessionColumns = ReturnType<typeof getTableColumns<typeof sessionT>>
import { UserColumns } from "./user.ts"


// #region CREATE

/** create
 * 
 * Create a row in `sessionT`.
 */
export const create = async (
	values: z.infer<typeof createFullSessionRowSchema>,
	sharedTx?: DBTransaction
): Promise<
	{
		result: SelectSession,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Create session
		const {
			result: rows,
			error: cError
		} = await gCreate(sessionT, asLiteralArray({
			userId: values.user.id,
			...values.session
		}), sharedTx)
		if (cError !== null) throw cError

		const row = zodTableSchemas.session.select.parse(rows[0])

		// Return created row
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


// #region READ

/** readOne
 * 
 * Use a dynamic query to:
 * 	- Find a row of `sessionT` filtered by `filters.session`.
 * 	- Join a row of `userT` filtered by `filters.user`.
 * 
 * If more than one row found, return an error.
 */
export const readOne = async (
	filters: {
		session?: (
			session: SessionColumns,
			operators: typeof cOps
		) => SQL | undefined,
		user?: (
			user: UserColumns,
			operators: typeof cOps
		) => SQL | undefined
	}
): Promise<
	{
		result: selectFullSessionRow,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read sessions
		const {
			result: maybeRow,
			error: roSessionError
		} = await gReadOne(sessionT, (query) => {
			
			return query
				// Filter session columns
				.filter((session, cOps) => filters.session?.(session, cOps))

				// Join and filter relation columns
				.innerJoin(userT, (session, user, cOps) => cOps.and(
					cOps.eq(session.userId, user.id),
					filters.user?.(user, cOps)
				))
		})
		if (roSessionError !== null) throw roSessionError

		const row = selectFullSessionRowSchema.parse(maybeRow)

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

// #endregion READ


// #region Common Operations

/** safeCheckAuth
 * 
 * Check if a session and user exist, using the provided IDs.
 */
export const safeCheckAuth = async (
	values: z.infer<typeof authIdsSchema>
): Promise<
	{
		result: true,
		error: null
	} | {
		result: false,
		error: KnownError
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		const { userId, sessionId } = authIdsSchema.parse(values)

		// Find session row with matching IDs
		const {
			result: maybeRow,
			error: roSessionError
		} = await gReadOne(sessionT, (query) => {
			
			return query
				// Filter session columns
				.filter((session, cOps) => cOps.and(
					cOps.eq(session.id, sessionId),
					cOps.eq(session.userId, userId)
				))
		})
		if (roSessionError !== null) {
			if (!KnownError.isKnownError(roSessionError)) throw roSessionError

			switch (roSessionError.cause.code) {
				case "FindOneNoResult":
					return {
						result: false,
						error: new KnownError("Incorrect authentication", {
							code: "IncorrectAuth"
						})
					}
				
				default:
					throw roSessionError
			}
		}

		// Will throw error if parsing fails
		zodTableSchemas.session.select.parse(maybeRow)

		return {
			result: true,
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