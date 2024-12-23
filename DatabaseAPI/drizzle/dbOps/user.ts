// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import generic CRUD operations
import { 
	gCreate,
	gReadMany,
	gReadOne,
	gUpdateMany,
	gUpdateOne,
	gDeleteMany,
	gDeleteOne,
	gFindUniqueCollisions
} from "./generic.ts"


// Import utils
import {
	getTableColumns,
} from "drizzle-orm"

import { 
	tables,
	conditionalOperators as cOps,
} from "../dbUtils.ts"



// Import types
import type { 
	InferInsertModel,
	InferSelectModel,
	SQL
} from "drizzle-orm"

import {
	NotNull,
	asLiteralArray
} from "@/Utils/typeUtils.ts"

// #endregion Imports



// Get tables used in this file
const { 
	user: userT, 
	email: emailT 
} = tables



// #region CREATE

/** create
 * 
 * Use a transaction to:
 * 	- Create a single row in `userT`.
 * 	- Create a single row in `emailT` joined to the new `userT` row.
 */
export const create = async (
	// Infer the types of the tables
	values: {
		user: InferInsertModel<typeof userT>

		// Omit `userId` since it will be found in the user row
		email: Omit<InferInsertModel<typeof emailT>, "userId">
	}
): Promise<
	{
		result: {
			user: InferSelectModel<typeof userT>,
			email: InferSelectModel<typeof emailT>
		},
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Create a transaction
		const txResult = await db.transaction(async (tx) => {
	
			// Create user
			const {
				result: users,
				error: cUserError
			} = await gCreate(tables.user, asLiteralArray(values.user), tx)
	
			if (cUserError !== null) {
				throw new Error("Failed to create user")
			}

			const user = users[0]

	

			// Create email
			const {
				result: emails,
				error: cEmailError
			} = await gCreate(tables.email, asLiteralArray({
				userId: user.id,
				...values.email,
			}), tx)
	
			if (cEmailError !== null) {
				throw new Error("Failed to create email for user")
			}

			const email = emails[0]


			// Return created rows
			return {
				result: {
					user: user,
					email: email
				},
				error: null
			}
		})

		return txResult
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

type FullUserRow = {
	user: InferSelectModel<typeof userT>,
	email: InferSelectModel<typeof emailT>
}

/** readMany
 * 
 * Use a dynamic query to:
 * 	- Find rows of `userT` filtered by `filters.user`.
 * 	- Join rows of `emailT` filtered by `filters.email`.
 */
export const readMany = async (
	filters: {
		user?: (
			user: ReturnType<typeof getTableColumns<typeof userT>>,
			operators: typeof cOps
		) => SQL | undefined,
		email?: (
			user: ReturnType<typeof getTableColumns<typeof userT>>,
			email: ReturnType<typeof getTableColumns<typeof emailT>>,
			operators: typeof cOps
		) => SQL | undefined
	}
): Promise<
	{
		result: FullUserRow[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read users
		const {
			result: rows,
			error: rUserError
		} = await gReadMany(userT, (query) => {

			return query
				// Filter user columns
				.filter((user, cOps) => filters.user?.(user, cOps))

				// Join and filter relation columns
				.innerJoin(emailT, (user, email, cOps) => cOps.and(
					cOps.eq(user.id, email.userId),
					filters.email?.(userT, email, cOps)
				))
		})

		if (rUserError !== null) {
			throw new Error("Failed to read many users")
		}

		
		return {
			result: rows as FullUserRow[],
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

/** readOne
 * 
 * Use a dynamic query to:
 * 	- Find a row of `userT` filtered by `filters.user`.
 * 	- Join a row of `emailT` filtered by `filters.email`.
 * 
 * If more than one row found, return an error.
 */
export const readOne = async (
	filters: {
		user?: (
			user: ReturnType<typeof getTableColumns<typeof userT>>,
			operators: typeof cOps
		) => SQL | undefined,
		email?: (
			user: ReturnType<typeof getTableColumns<typeof userT>>,
			email: ReturnType<typeof getTableColumns<typeof emailT>>,
			operators: typeof cOps
		) => SQL | undefined
	}
): Promise<
	{
		result: FullUserRow,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read users
		const {
			result: user,
			error: rUserError
		} = await gReadOne(userT, (query) => {

			return query
				// Filter user columns
				.filter((user, cOps) => filters.user?.(user, cOps))

				// Join and filter relation columns
				.innerJoin(emailT, (user, email, cOps) => cOps.and(
					cOps.eq(user.id, email.userId),
					filters.email?.(userT, email, cOps)
				))
		})

		if (rUserError !== null) {
			throw new Error("Failed to read one user")
		}


		return {
			result: user as FullUserRow,
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


// #region MISC

/** findUniqueCollisions
 * 
 * Return an array of column names for each table.
 * 
 * Each array contains only the column names that already have a value in 
 * the database matching the value provided in `values`.
 */
export const findUniqueCollisions = async (
	values: Partial<{
		user: Partial<InferSelectModel<typeof userT>>,
		email: Partial<InferSelectModel<typeof emailT>>
	}>
): Promise<
	{
		result: {
			user: (keyof InferSelectModel<typeof userT> | undefined)[],
			email: (keyof InferSelectModel<typeof emailT> | undefined)[]
		},
		error: null
	} | {
		result: null,
		error: unknown
	}
> => {
	try {
		// Get collisions from user values
		const {
			result: takenUserColumns,
			error: rUserError
		} = await gFindUniqueCollisions(
			userT,
			values.user ?? {}
		)

		if (rUserError !== null) {
			throw new Error("Failed with finding unique collisions for user")
		}


		// Get collisions from email values
		const {
			result: takenEmailColumns,
			error: rEmailError
		} = await gFindUniqueCollisions(
			emailT,
			values.email ?? {}
		)

		if (rEmailError !== null) {
			throw new Error("Failed with finding unique collisions for email")
		}

		
		// Return results from all queries
		return {
			result: {
				user: takenUserColumns,
				email: takenEmailColumns
			},
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

// #endregion MISC