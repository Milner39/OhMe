// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import tables
import { tables } from "../dbUtils.ts"

// #endregion Imports



const createUser = async (username: string) => {

	// Create transaction that rolls back if there is an error
	await db.transaction(async (tx) => {

		// Create user
		const user = (await tx.insert(tables.user)
			.values({
				username: username
			})
			.returning()
		)[0]

		// Create email
		await tx.insert(tables.email)
			.values({
				userId: user.id,
				address: `${username}@example.com`
			})

		/*
			A transaction is used here in case there is an error 
			creating the email record. A user record should not 
			exist without a related email record and vice versa.

			Transactions save after all of the code inside of them
			has executed.
		*/
	})
}


const readUser = async (username: string) => {

	// Read user
	const user = (await db.query.user.findFirst({

		// Include relations
		with: {
			email: true
		},

		// Filter
		where: (user, { eq }) => eq(user.username, username)
	}))
	
	return user
}


await createUser("Finn")
console.log(await readUser("Finn"))