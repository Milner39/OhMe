// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import tables
import { tables } from "../dbUtils.ts"

// Import generic CRUD operations
import { gCreate, gRead } from "./generic.ts"


// Import types
import { InferSelectModel, InferInsertModel } from "drizzle-orm"

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
	// Infer the types of the tables
	values: {
		user: InferSelectModel<typeof tables.user>,
		email: InferSelectModel<typeof tables.email>
	}
) => {
	try {
		// Read user
		const {
			result: user,
			error: rUserError
		} = await gRead((query) => {
			query.user.findMany({
				where: (user, { and, eq }) => and(
					...Object.entries(values.user).map(([key, value]) => {
						return eq(
							user[key as keyof typeof user],
							value
						)
					})
				),
				with: {
					email: true
				}
			})
		})
		
		if (rUserError) {
			throw new Error("Failed to read user")
		}

		return {
			result: user,
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


console.log(await create({
	user: {
		username: "Molly"
	},
	email: {
		address: "Molly@example.com"
	}
}))