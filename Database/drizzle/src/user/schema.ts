// #region Imports

// Import to create table, columns, and relations
import { pgTable, uuid, varchar, char } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Import other table schemas
import { email } from "../email/schema.ts"

// #endregion Imports



// Define table schema
export const user = pgTable("user", {
	// #region Primary & Foreign keys

	// Primary key
	id: uuid("id")
		.primaryKey()
		.defaultRandom(),

	// #endregion Primary & Secondary keys



	// #region Columns

	// Username, max length 64 chars
	username: varchar("username", { length: 64 })
		.notNull()
		.unique(),

	// Web3 address, fixed length 42 chars
	web3Address: char("web3Address", { length: 42 })

	// #endregion Columns
})

// Define table relations
export const userRelations = relations(user, ({ one }) => ({
	// Email relation
	email: one(email)
}))