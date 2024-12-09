// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import utils
import { 
	conditionalOperators as cOps,
	tables 
} from "../dbUtils.ts"

// Import generic CRUD operations
import { gCreate, gRead, gFindUniqueCollisions } from "./generic.ts"


// Import types
import type { InferSelectModel, InferInsertModel, SQLWrapper } from "drizzle-orm"

// #endregion Imports



// #region CREATE

export const create = async (
	// Infer the types of the tables
	values: {
		user: InferInsertModel<typeof tables.user>

		// Omit `userId` since it will be found in the user record
		email: Omit<InferInsertModel<typeof tables.email>, "userId">
	}
) => {
	try {
		// Create a transaction
		const txResult = await db.transaction(async (tx) => {
	
			// Create user
			const { 
				result: user,
				error: cUserError 
			} = await gCreate(tables.user, values.user, tx)
	
			if (cUserError || !user) {
				throw new Error("Failed to create user")
			}

	
			// Create email
			const {
				result: email,
				error: cEmailError
			} = await gCreate(tables.email, {
				...values.email,
				userId: user.id
			}, tx)
	
			if (cEmailError || !email) {
				throw new Error("Failed to create email for user")
			}


			// Return combined records
			return {
				result: {
					...user,
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
			error: error
		}
	}
}

// #endregion CREATE


// #region READ

export const read = async (
	filters: {
		user?: (
			user: typeof tables.user._.columns,
			operators: typeof cOps
		) => SQLWrapper | undefined,
		email?: (
			email: typeof tables.email._.columns,
			operators: typeof cOps
		) => SQLWrapper | undefined
	}
) => {
	try {
		// Read users
		const {
			result: users,
			error: rUserError
		} = await gRead(async (query) => {

			// Read emails
			const emailIds = (filters.email) ? (await query.email.findMany({
				columns: { userId: true },
				where: (email) => cOps.and(
					(filters.email) ? filters.email(email, cOps) : undefined
				)
			})).map(row => row.userId) : []

			// Read users
			const users = await query.user.findMany({
				where: (user) => cOps.and(

					// user filters
					(filters.user) ? filters.user(user, cOps) : undefined,
					

					// Relational filters
					// email
					(filters.email) ? cOps.inArray(
						user.id,
						emailIds
					) : undefined
				),

				with: {
					email: true
				}
			})

			return users
		})

		if (rUserError) {
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
			error: error
		}
	}
}

// #endregion READ


// #region MISC

// Find unique column collisons
const findUniqueCollisons = async (
	values: Partial<{
		user: Partial<InferSelectModel<typeof tables.user>>,
		email: Partial<InferSelectModel<typeof tables.email>>
	}>
): Promise<
	{
		result: {
			users: (keyof InferSelectModel<typeof tables.user> | undefined)[],
			emails: (keyof InferSelectModel<typeof tables.email> | undefined)[]
		},
		error: null
	} | {
		result: null,
		error: unknown
	}
> => {
	try {
		// Get collisons from user values
		const {
			result: takenUserColumns,
			error: rUserError
		} = values.user ? await gFindUniqueCollisions(
			values.user,
			tables.user
		) : {
			result: [],
			error: null
		}

		if (rUserError || takenUserColumns === null) {
			throw new Error("Failed with finding unique collisions for user")
		}


		const {
			result: takenEmailColumns,
			error: rEmailError
		} = values.email ? await gFindUniqueCollisions(
			values.email,
			tables.email
		) : {
			result: [],
			error: null
		}

		if (rEmailError || takenEmailColumns === null) {
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


console.log(await findUniqueCollisons(
	{
		user: {
			username: "Molly"
		},
		email: {
			address: "Finn@example.com"
		}
	}
))
