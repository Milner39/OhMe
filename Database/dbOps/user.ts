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
} from "../../Utils/typeUtils.ts"

// #endregion Imports



// Get tables used in this file
const { 
	user: userT, 
	email: emailT 
} = tables

// #region CREATE

export const create = async (
	// Infer the types of the tables
	values: {
		user: InferInsertModel<typeof userT>

		// Omit `userId` since it will be found in the user record
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


			// Return combined records
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
		result: unknown[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read users
		const {
			result: users,
			error: rUserError
		} = await gReadMany(userT, (query) => {

			return query
				// Filter user columns
				.filter((user, cOps) => filters.user?.(user, cOps))

				// Filter relation columns
				.innerJoin(emailT, (user, email, cOps) => cOps.and(
					cOps.eq(user.id, email.userId),
					filters.email?.(userT, email, cOps)
				))
		})

		if (rUserError !== null) {
			throw new Error("Failed to read users")
		}


		return {
			result: users,
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

// Find unique column collisions
export const findUniqueCollisions = async (
	values: Partial<{
		user: Partial<InferSelectModel<typeof userT>>,
		email: Partial<InferSelectModel<typeof emailT>>
	}>
): Promise<
	{
		result: {
			users: (keyof InferSelectModel<typeof userT> | undefined)[],
			emails: (keyof InferSelectModel<typeof emailT> | undefined)[]
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
				users: takenUserColumns,
				emails: takenEmailColumns
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