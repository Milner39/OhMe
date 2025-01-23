// #region Imports

// Import db connection
import { getTableColumns, SQL } from "drizzle-orm"
import db, { DBTransaction } from "../db-connection"
import { conditionalOperators as cOps } from "../db-utils"
import tables, { zodTableSchemas } from "../schemas/index"
import { 
	gCreate,
	gReadMany,
	gReadOne,
	// gUpdateMany,
	// gUpdateOne,
	// gDeleteMany,
	// gDeleteOne,
	gFindUniqueCollisions
} from "./generic"
import { z } from "zod"
import { authIdsSchema } from "#validation/src/zod-schemas/index"
import { KnownError } from "#utils/src/error-utils"
import { NotNull, asLiteralArray, PartialKeysTrue } from "#utils/src/type-utils"

import { create as createSession, safeCheckAuth } from "./session"

// #endregion Imports



// Get tables used in this file
const { 
	user: userT,
	email: emailT,
	password: passwordT,
	session: sessionT
} = tables



// Define Zod schemas
const selectExtendedUserSchema = z.object({
	user: zodTableSchemas.user.select,
	email: zodTableSchemas.email.select,
	password: zodTableSchemas.password.select
})

const createExtendedUserSchema = z.object({
	user: zodTableSchemas.user.insert,
	email: zodTableSchemas.email.pureInsert,
	password: zodTableSchemas.password.pureInsert
})


const selectFullUserSchema = z.object({
	user: zodTableSchemas.user.select,
	email: zodTableSchemas.email.select,
	password: zodTableSchemas.password.select,
	session: z.array(zodTableSchemas.session.select)
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

const safeSelectFullUserSchema = z.object({
	user: zodTableSchemas.user.safeSelect,
	email: zodTableSchemas.email.safeSelect,
	password: zodTableSchemas.password.safeSelect,
	session: z.array(zodTableSchemas.session.safeSelect)
})



// Define types
export type SelectUser = z.infer<typeof zodTableSchemas.user.select>
export type SelectEmail = z.infer<typeof zodTableSchemas.email.select>
export type SelectPassword = z.infer<typeof zodTableSchemas.password.select>
export type SelectExtendedUser = z.infer<typeof selectExtendedUserSchema>
export type SelectFullUser = z.infer<typeof selectFullUserSchema>
export type SafeSelectFullUser = z.infer<typeof safeSelectFullUserSchema>


export type UserColumns = ReturnType<typeof getTableColumns<typeof userT>>
export type EmailColumns = ReturnType<typeof getTableColumns<typeof emailT>>
export type PasswordColumns = ReturnType<typeof getTableColumns<typeof passwordT>>
import { SessionColumns } from "./session"



// #region CREATE

/** create
 * 
 * Create 1 extended row in the database.
 */
export const create = async (
	values: z.infer<typeof createExtendedUserSchema>,
	sharedTx?: DBTransaction
): Promise<
	{
		result: SelectExtendedUser,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Validate values
		createExtendedUserSchema.parse(values)


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


			// Parse the full row
			const extendedRow = selectExtendedUserSchema.parse({
				user: user,
				email: email,
				password: password
			})

			return {
				result: extendedRow,
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
 * Get 0 or multiple full rows from the database.
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
		) => SQL | undefined,
		session?: (
			user: UserColumns,
			password: SessionColumns,
			operators: typeof cOps
		) => SQL | undefined
	}
): Promise<
	{
		result: SelectFullUser[],
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read users
		const {
			result: maybeExtendedUsers,
			error: rmUserError
		} = await gReadMany(userT, (query) => {
			return query
				// Filter user columns
				.filter((user, cOps) => filters.user?.(user, cOps))

				// Join and filter one to one relation columns
				.innerJoin(emailT, (user, email, cOps) => cOps.and(
					cOps.eq(user.id, email.userId),
					filters.email?.(userT, email, cOps)
				))
				.innerJoin(passwordT, (user, password, cOps) => cOps.and(
					cOps.eq(user.id, password.userId),
					filters.password?.(userT, password, cOps)
				))
		})
		if (rmUserError !== null) throw rmUserError
		const extendedUsers = z.array(selectExtendedUserSchema)
			.parse(maybeExtendedUsers)

		
		// Create an array of full rows
		const fullRows: SelectFullUser[] = []

		// Read sessions
		for (const extendedUser of extendedUsers) {
			const {
				result: maybeSessions,
				error: rmSessionError
			} = await gReadMany(sessionT, (query) => {
				return query
					// Filter session columns
					.filter((session, cOps) => cOps.and(
						cOps.eq(session.userId, extendedUser.user.id),
						filters.session?.(userT, session, cOps)
					))
			})
			if (rmSessionError !== null) throw rmSessionError
			const sessions = z.array(zodTableSchemas.session.select)
				.parse(maybeSessions)
			
			fullRows.push(selectFullUserSchema.parse({
				...extendedUser,
				session: sessions
			}))
		}
		
		return {
			result: fullRows,
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
 * Get 1 full row from the database.
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
		) => SQL | undefined,
		session?: (
			user: UserColumns,
			password: SessionColumns,
			operators: typeof cOps
		) => SQL | undefined
	}
): Promise<
	{
		result: SelectFullUser,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Read user
		const {
			result: maybeExtendedUser,
			error: roUserError
		} = await gReadOne(userT, (query) => {
			return query
				// Filter user columns
				.filter((user, cOps) => filters.user?.(user, cOps))

				// Join and filter one to one relation columns
				.innerJoin(emailT, (user, email, cOps) => cOps.and(
					cOps.eq(user.id, email.userId),
					filters.email?.(userT, email, cOps)
				))
				.innerJoin(passwordT, (user, password, cOps) => cOps.and(
					cOps.eq(user.id, password.userId),
					filters.password?.(userT, password, cOps)
				))
		})
		if (roUserError !== null) throw roUserError
		const extendedUser = selectExtendedUserSchema.parse(maybeExtendedUser)

		// Read sessions
		const {
			result: maybeSessions,
			error: rmSessionError
		} = await gReadMany(sessionT, (query) => {
			return query
				// Filter session columns
				.filter((session, cOps) => cOps.and(
					cOps.eq(session.userId, extendedUser.user.id),
					filters.session?.(userT, session, cOps)
				))
		})
		if (rmSessionError !== null) throw rmSessionError
		const sessions = z.array(zodTableSchemas.session.select)
			.parse(maybeSessions)


		// Parse the full row
		const fullRow = selectFullUserSchema.parse({
			...extendedUser,
			session: sessions
		})

		return {
			result: fullRow,
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

/** registerUser
 * 
 * Create a user and session in the database.
 * Return the IDs.
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
		// Validate values
		registerUserSchema.parse(values)


		// Check for unique collisions
		const {
			result: collisions,
			error: fuCollisionsError
		} = await findUniqueCollisions(values)
		if (fuCollisionsError !== null) throw fuCollisionsError
		if (
			Object.values(collisions)
				.some(row => Object.keys(row).length > 0)
		) throw new KnownError("Unique collision found", {
			code: "UniqueCollision",
			target: collisions
		})

		// Create a DB transaction
		const txResult = await db.transaction(async (tx) => {
			// Create user
			const {
				result: extendedUser,
				error: cEUserError
			} = await create(values, tx)
			if (cEUserError !== null) throw cEUserError

			// Create session
			const {
				result: session,
				error: cSessionError
			} = await createSession({
				user: { id: extendedUser.user.id },
				session: { expiresAt: new Date() } // TODO: PROPER EXPIRY DATE
			}, tx)
			if (cSessionError !== null) throw cSessionError


			// Return IDs
			return {
				result: {
					userId: extendedUser.user.id,
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
 * Create a session in the database.
 * Return the IDs.
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
		// Validate values
		logInUserSchema.parse(values)


		// Read the user row with the matching information
		const {
			result: fullUser,
			error: roFUserError
		} = await readOne({
			user: (user, cOps) => cOps.eq(user.username, values.user.username)
		})
		if (roFUserError !== null) throw roFUserError

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
 * Use provided user and session ID to find user information.
 * Check if the IDs match up.
 * Only return non-sensitive information.
 */
export const safeRead = async (
	auth: z.infer<typeof authIdsSchema>
): Promise<
	{
		result: SafeSelectFullUser,
		error: null
	} | {
		result: null,
		error: NotNull
	}
> => {
	try {
		// Validate auth
		authIdsSchema.parse(auth)

		// Check if auth is correct
		const {
			result: authRes,
			error: authError
		} = await safeCheckAuth(auth)
		if (!authRes || authError !== null) throw authError


		// Read the user row with the matching information
		const {
			result: fullUser,
			error: roUserError
		} = await readOne({
			user: (user, cOps) => cOps.eq(user.id, auth.userId),
			session: (_, session, cOps) => cOps.eq(session.id, auth.sessionId)
		})
		if (roUserError !== null) throw roUserError


		// Parse the non-sensitive information
		const safeRow = safeSelectFullUserSchema.parse(fullUser)

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