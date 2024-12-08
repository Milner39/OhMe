// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import utils
import { 
	filterUniqueColumns,
	conditionalOperators as cOps,
	tables 
} from "../dbUtils.ts"
import { tsObjectEntries, tsObjectKeys } from "../../Utils/objectUtils.ts"

// Import generic CRUD operations
import { gCreate, gRead } from "./generic.ts"


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



// #region Read per unique column

export const findTakenUniqueColumns = async (
	filters: Partial<{
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
		// Reduce filter to unique columns
		const userUniqueColumnValues = filters.user ? 
			filterUniqueColumns(filters.user, tables.user) : 
			{} as Partial<InferSelectModel<typeof tables.user>>
	
		const emailUniqueColumnValues = filters.email ?
			filterUniqueColumns(filters.email, tables.email) :
			{} as Partial<InferSelectModel<typeof tables.email>>
	
		
		// Remove columns with null values since they are not unique
		for (const column of tsObjectKeys(userUniqueColumnValues)) {
			if (!column) continue
	
			if (userUniqueColumnValues[column] === null) {
				delete userUniqueColumnValues[column]
			}
		}
	
		for (const column of tsObjectKeys(emailUniqueColumnValues)) {
			if (!column) continue
	
			if (emailUniqueColumnValues[column] === null) {
				delete emailUniqueColumnValues[column]
			}
		}
	
	
		// Read users based on user filters
		const { 
			result: users,
			error: usersError
		} = tsObjectKeys(userUniqueColumnValues).length > 0 ?
			await read({
				user: (user, { or, eq }) => or(
					...(tsObjectEntries(userUniqueColumnValues)
						.map((column) => {
							if (!column) {
								return undefined
							}
	
							// @ts-ignore:
							return eq(
								user[column[0]], 
								column[1]
							)
						})
				))
			}) : { 
				result: [],
				error: null
			}
		
		if (usersError) {
			throw new Error("Failed to read users by user filters")
		}
		
		
		// Read emails based on email filters
		const {
			result: usersFromEmails,
			error: emailsError
		} = tsObjectKeys(emailUniqueColumnValues).length > 0 ?
			await read({
				email: (email, { or, eq }) => or(
					...(tsObjectEntries(emailUniqueColumnValues)
						.map((column) => {
							if (!column) {
								return undefined
							}
	
							// @ts-ignore:
							return eq(
								email[column[0]], 
								column[1]
							)
						})
				))
			}) : { 
				result: [],
				error: null
			}

		if (emailsError) {
			throw new Error("Failed to read users by email filters")
		}

		// @ts-ignore:
		const emails = usersFromEmails.map(user => user.email) as
			InferSelectModel<typeof tables.email>[]


		// Find taken unique user column values
		const takenUserColumns: 
			(keyof typeof userUniqueColumnValues | undefined)[] = []

		if (users && users.length > 0) {
			for (const user of users ) {
				for (const column of tsObjectKeys(userUniqueColumnValues)) {
					if (!column) continue
	
					if (user[column] === userUniqueColumnValues[column]) {
						takenUserColumns.push(column)
					}
				}
			}
		}

		// Find taken unique email column values
		const takenEmailColumns: 
			(keyof typeof emailUniqueColumnValues | undefined)[] = []
			
		if (emails && emails.length > 0) {
			for (const email of emails ) {
				for (const column of tsObjectKeys(emailUniqueColumnValues)) {
					if (!column) continue
	
					if (email[column] === emailUniqueColumnValues[column]) {
						takenEmailColumns.push(column)
					}
				}
			}
		}
		
	
		// Return results from both queries
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

// #endregion Read per unique column

console.log(await findTakenUniqueColumns({
	user: {
		username: "Molly",
	},
	email: {
		address: "Finn@example.com"
	}
}))