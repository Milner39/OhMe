// #region Imports

// Import db connection
import db from "../dbConnection.ts"

// Import tables
import { tables } from "../dbUtils.ts"

// #endregion Imports


const count = await db.$count(tables.user)

await db.insert(tables.user).values({
	username: `test${count}`,
	email: `test${count}@email.com`
})

const result = await db.query.user.findMany()

console.log(result)