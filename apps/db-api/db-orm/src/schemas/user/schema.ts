// #region Imports

import { pgTable, uuid, varchar, char } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { 
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema
} from "drizzle-zod"
import {
	username as usernameSchema
} from "#validation/src/zod-schemas/index"

import { email } from "../email/schema"
import { password } from "../password/schema"
import { session } from "../session/schema"
import { transaction } from "../transaction/schema"

// #endregion Imports



// Define table schema
export const user = pgTable("user", {
	// #region Primary & Foreign keys

	// Primary key, UUID, default to random
	id: uuid("id")
		.primaryKey()
		.defaultRandom(),

	// #endregion Primary & Foreign keys



	// #region Secondary keys

	// Username, max length 64 chars
	username: varchar("username", { length: 64 })
		.notNull()
		.unique(),

	// Web3 address, fixed length 42 chars
	web3Address: char("web3Address", { length: 42 })

	// #endregion Secondary keys
})

// Define Zod schemas
export const userSelectSchema = createSelectSchema(user)

export const userSafeSelectSchema = userSelectSchema.omit({
	id: true
})

export const userInsertSchema = createInsertSchema(user).omit({
	id: true
}).setKey("username", usernameSchema)

export const userUpdateSchema = createUpdateSchema(user).omit({
	id: true
}).setKey("username", usernameSchema)



// Define table relations
export const userRelations = relations(user, ({ one, many }) => ({
	// Email relation
	email: one(email),

	// Password relation
	password: one(password),

	// Session relation
	session: many(session),

	// Transaction relation
	transaction: many(transaction)
}))