// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import tables
import { tables } from "../dbUtils.ts"

// #endregion Imports



const createUser = async () => {

	const count = await db.$count(tables.user)

	await db.transaction(async (tx) => {
		// Create user
		const user = (await tx.insert(tables.user)
			.values({
				username: `user${count + 1}`
			})
			.returning()
		)[0]

		// Create email
		await tx.insert(tables.email)
			.values({
				userId: user.id,
				address: `user${count + 1}@example.com`
			})
	})
}


const readUser = async () => {
	const user = await db.query.user.findMany({
		with: {
			email: true
		},
		where: (user, { eq }) => eq(user.username, "user1")
	})
	

	return user
}

console.log(await readUser())