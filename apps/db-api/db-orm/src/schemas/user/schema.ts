// #region Imports

// Import to create table, columns, and relations
import { pgTable, uuid, varchar, char } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Import to create Zod schemas
import { createSelectSchema } from "drizzle-zod"
import {
	username as usernameSchema
} from "#validation/src/zod-schemas/index.ts"

// Import other table schemas
import { email } from "../email/schema.ts"
import { password } from "../password/schema.ts"
import { session } from "../session/schema.ts"

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
export const userSelectSchema = createSelectSchema(user).required()

export const userSafeSelectSchema = createSelectSchema(user).omit({
	id: true
})

export const userInsertSchema = createSelectSchema(user).omit({
	id: true
}).setKey("username", usernameSchema)

export const userUpdateSchema = createSelectSchema(user).omit({
	id: true
}).setKey("username", usernameSchema)



// Define table relations
export const userRelations = relations(user, ({ one, many }) => ({
	// Email relation
	email: one(email),

	// Password relation
	password: one(password),

	// Session relation
	session: many(session)
}))



import { z } from "zod"

type inferred = z.infer<typeof userSelectSchema>