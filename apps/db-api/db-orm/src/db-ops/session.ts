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


// Import types
import type { DBTransaction } from "../db-connection.ts"

import {
	NotNull,
	asLiteralArray
} from "#utils/src/type-utils.ts"

// #endregion Imports



// Get tables used in this file
const { 
	session: sessionT
} = tables


// Define types
export type SelectSession = z.infer<typeof zodTableSchemas.session.select>



// #region CREATE

const createFullSessionRowSchema = z.object({
	user: zodTableSchemas.user.select.pick({ id: true }),

	// Omit `userId` since it is provided
	session: zodTableSchemas.session.insert.omit({ userId: true }),
})

/** create
 * 
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
			result: sessions,
			error: cSessionError
		} = await gCreate(sessionT, asLiteralArray({
			userId: values.user.id,
			...values.session
		}), sharedTx)

		if (cSessionError !== null) {
			throw new Error("Failed to create session")
		}

		const session = zodTableSchemas.session.select.parse(sessions[0])

		// Return created row
		return {
			result: session,
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