// #region Imports

import { z } from "zod"

import { KnownError } from "#utils/src/error-utils.ts"

// Import db connection
import db from "../db-connection.ts"

// Import generic CRUD operations
import { 
	gCreate,
	gReadMany,
	gReadOne,
	// gUpdateMany,
	// gUpdateOne,
	// gDeleteMany,
	// gDeleteOne,
	gFindUniqueCollisions
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


// Import types
import type { DBTransaction } from "../db-connection.ts"

import type { SQL } from "drizzle-orm"

import {
	NotNull,
	asLiteralArray,
	PartialKeysTrue
} from "#utils/src/type-utils.ts"

// #endregion Imports



// Get tables used in this file
const { 
	user: userT,
	email: emailT,
	password: passwordT,
	session: sessionT
} = tables



// Define Zod schemas
const selectFullUserRowSchema = z.object({
	user: zodTableSchemas.user.select,
	email: zodTableSchemas.email.select,
	password: zodTableSchemas.password.select,
	session: zodTableSchemas.session.select
})

const createFullUserRowSchema = z.object({
	user: zodTableSchemas.user.insert,
	email: zodTableSchemas.email.pureInsert,
	password: zodTableSchemas.password.pureInsert
})

const registerUserSchema = z.object({
	user: zodTableSchemas.user.insert.pick({ username: true }),
	email: zodTableSchemas.email.insert.pick({ address: true }),
	password: zodTableSchemas.password.insert.pick({ hash: true })
})

const logInUserSchema = z.object({
	user: zodTableSchemas.user.select.pick({ username: true }),
	password: zodTableSchemas.password.select.pick({ hash: true })
})

const safeReadSchema = z.object({
	user: zodTableSchemas.user.safeSelect,
	email: zodTableSchemas.email.safeSelect,
	password: zodTableSchemas.password.safeSelect,
	session: zodTableSchemas.session.safeSelect
})



// Define types
export type SelectUser = z.infer<typeof zodTableSchemas.user.select>
export type SelectEmail = z.infer<typeof zodTableSchemas.email.select>
export type SelectPassword = z.infer<typeof zodTableSchemas.password.select>
export type SelectFullUserRow = z.infer<typeof selectFullUserRowSchema>

export type SafeSelectUserSession = z.infer<typeof safeReadSchema>


export type UserColumns = ReturnType<typeof getTableColumns<typeof userT>>
export type EmailColumns = ReturnType<typeof getTableColumns<typeof emailT>>
export type PasswordColumns = ReturnType<typeof getTableColumns<typeof passwordT>>
import { SessionColumns } from "./session.ts"



// #region CREATE

/** create
 * 
 * Use a transaction to:
 * 	- Create a single row in `userT`.
 * 	- Create a single row in `emailT` joined to the new `userT` row.
 * 	- Create a single row in `passwordT` joined to the new `userT` row.
 */
export const create = async (
	values: z.infer<typeof createFullUserRowSchema>,
	sharedTx?: DBTransaction
): Promise<
	{
		result: SelectFullUserRow,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Create a DB transaction
		const txResult = await (sharedTx || db).transaction(async (tx) => {
	
			// Create user
			const {
				result: users,
				error: cUserError
			} = await gCreate(userT, asLiteralArray(values.user), tx)
			if (cUserError !== null) throw cUserError

			const user = users[0]

	

			// Create email
			const {
				result: emails,
				error: cEmailError
			} = await gCreate(emailT, asLiteralArray({
				userId: user.id,
				...values.email,
			}), tx)
			if (cEmailError !== null) throw cEmailError

			const email = emails[0]


			// Create password
			const {
				result: passwords,
				error: cPasswordError
			} = await gCreate(passwordT, asLiteralArray({
				userId: user.id,
				...values.password,
			}), tx)
			if (cPasswordError !== null) throw cPasswordError

			const password = passwords[0]



			const fullRow = selectFullUserRowSchema.parse({
				user: user,
				email: email,
				password: password
			})

			// Return created rows
			return {
				result: fullRow,
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

/** readMany
 * 
 * Use a dynamic query to:
 * 	- Find rows of `userT` filtered by `filters.user`.
 * 	- Join rows of `emailT` filtered by `filters.email`.
 */
export const readMany = async (
	filters: {
		user?: (
			user: UserColumns,
			operators: typeof cOps
		) => SQL | undefined,
		email?: (
			user: UserColumns,
			email: EmailColumns,
			operators: typeof cOps
		) => SQL | undefined,
		password?: (
			user: UserColumns,
			password: PasswordColumns,
			operators: typeof cOps
		) => SQL | undefined
	}
): Promise<
	{
		result: SelectFullUserRow[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read users
		const {
			result: maybeRows,
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
				.innerJoin(passwordT, (user, password, cOps) => cOps.and(
					cOps.eq(user.id, password.userId),
					filters.password?.(userT, password, cOps)
				))
		})
		if (rUserError !== null) throw rUserError

		const rows = z.array(selectFullUserRowSchema).parse(maybeRows)
		
		return {
			result: rows,
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
 * 	- Join a row of `passwordT` filtered by `filters.password`.
 * 
 * If more than one row found, return an error.
 */
export const readOne = async (
	filters: {
		user?: (
			user: UserColumns,
			operators: typeof cOps
		) => SQL | undefined,
		email?: (
			user: UserColumns,
			email: EmailColumns,
			operators: typeof cOps
		) => SQL | undefined,
		password?: (
			user: UserColumns,
			password: PasswordColumns,
			operators: typeof cOps
		) => SQL | undefined
		session?: (
			user: UserColumns,
			password: SessionColumns,
			operators: typeof cOps
		) => SQL | undefined
	}
): Promise<
	{
		result: SelectFullUserRow,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read users
		const {
			result: maybeRow,
			error: roUserError
		} = await gReadOne(userT, (query) => {

			return query
				// Filter user columns
				.filter((user, cOps) => filters.user?.(user, cOps))

				// Join and filter relation columns
				.innerJoin(emailT, (user, email, cOps) => cOps.and(
					cOps.eq(user.id, email.userId),
					filters.email?.(userT, email, cOps)
				))
				.innerJoin(passwordT, (user, password, cOps) => cOps.and(
					cOps.eq(user.id, password.userId),
					filters.password?.(userT, password, cOps)
				))
				.innerJoin(sessionT, (user, session, cOps) => cOps.and(
					cOps.eq(user.id, session.userId),
					filters.session?.(userT, session, cOps)
				))
		})
		if (roUserError !== null) throw roUserError

		const row = selectFullUserRowSchema.parse(maybeRow)

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
		user: Partial<SelectUser>,
		email: Partial<SelectEmail>,
		password: Partial<SelectPassword>
	}>
): Promise<
	{
		result: {
			user: PartialKeysTrue<SelectUser>,
			email: PartialKeysTrue<SelectEmail>,
			password: PartialKeysTrue<SelectPassword>
		},
		error: null
	} | {
		result: null,
		error: NotNull
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
		if (rUserError !== null) throw rUserError


		// Get collisions from email values
		const {
			result: takenEmailColumns,
			error: rEmailError
		} = await gFindUniqueCollisions(
			emailT,
			values.email ?? {}
		)
		if (rEmailError !== null) throw rEmailError


		// Get collisions from password values
		const {
			result: takenPasswordColumns,
			error: rPasswordError
		} = await gFindUniqueCollisions(
			passwordT,
			values.password ?? {}
		)
		if (rPasswordError !== null) throw rPasswordError


		// Return results from all queries
		return {
			result: {
				user: takenUserColumns,
				email: takenEmailColumns,
				password: takenPasswordColumns
			},
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

// #endregion MISC


// #region Common Operations

import { 
	create as createSession,
	safeCheckAuth
} from "./session.ts"


/** registerUser
 * 
 * Use a transaction to:
 * 	- Create a full user row.
 *  - Create a session row, joined to the user.
 *  - If any step fails, rollback the transaction.
 * 
 * Return the IDs of the user and session row.
 */
export const registerUser = async (
	values: z.infer<typeof registerUserSchema>
): Promise<
	{
		result: {
			userId: string,
			sessionId: string
		},
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Check for unique collisions
		const {
			result: collisions,
			error: fuCollisionsError
		} = await findUniqueCollisions(values)
		if (fuCollisionsError !== null) throw fuCollisionsError

		if (
			Object.values(collisions)
				.some(row => Object.keys(row).length > 0)
		) {
			throw new KnownError("Unique collision found", {
				code: "UniqueCollision",
				target: collisions
			})
		}


		// Create a DB transaction
		const txResult = await db.transaction(async (tx) => {

			// Create user
			const {
				result: fullUser,
				error: cUserError
			} = await create(values, tx)
			if (cUserError !== null) throw cUserError


			// Create session
			const {
				result: session,
				error: cSessionError
			} = await createSession({
				user: { id: fullUser.user.id },
				session: { expiresAt: new Date() } // TODO: PROPER EXPIRY DATE
			}, tx)
			if (cSessionError !== null) throw cSessionError


			// Return IDs
			return {
				result: {
					userId: fullUser.user.id,
					sessionId: session.id
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


/** logInUser
 * 
 * Find a full user row.
 * Check the provided password information matches.
 * Create a session row joined to the user.
 * 
 * Return the IDs of the user and session row.
 */
export const logInUser = async (
	values: z.infer<typeof logInUserSchema>
): Promise<
	{
		result: {
			userId: string,
			sessionId: string
		},
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Find the user row with the matching information
		const {
			result: fullUser,
			error: roSessionError
		} = await readOne({
			user: (user, cOps) => cOps.eq(user.username, values.user.username)
		})
		if (roSessionError !== null) throw roSessionError


		// Check password information matches
		if (fullUser.password.hash !== values.password.hash) {
			throw new KnownError("Password Incorrect", {
				code: "LoginPasswordIncorrect"
			})
		}


		// Create session
		const {
			result: session,
			error: cSessionError
		} = await createSession({
			user: { id: fullUser.user.id },
			session: { expiresAt: new Date() } // TODO: PROPER EXPIRY DATE
		})
		if (cSessionError !== null) throw cSessionError
		

		// Return rows
		return {
			result: {
				userId: fullUser.user.id,
				sessionId: session.id
			},
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


/** safeRead
 * 
 * Use a provided user and session ID to find user information.
 * Check if the IDs match up.
 * Only return non-sensitive information.
 */
export const safeRead = async (
	values: z.infer<typeof authIdsSchema>
): Promise<
	{
		result: z.infer<typeof safeReadSchema>,
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
		} = await safeCheckAuth(values)
		if (!authRes || authError !== null) throw authError

		// Get the full user row
		const {
			result: fullUser,
			error: roUserError
		} = await readOne({
			user: (user, cOps) => cOps.eq(user.id, values.userId),
			session: (_, session, cOps) => cOps.eq(session.id, values.sessionId)
		})
		if (roUserError !== null) throw roUserError

		
		// Parse the non-sensitive information
		const safeRow = safeReadSchema.parse({
			user: fullUser.user,
			email: fullUser.email,
			password: fullUser.password,
			session: fullUser.session
		})

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