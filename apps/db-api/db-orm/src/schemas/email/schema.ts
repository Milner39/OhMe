// #region Imports

import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { 
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema
 } from "drizzle-zod"
import {
	email as addressSchema
} from "#validation/src/zod-schemas"

import { user } from "../user/schema"

// #endregion Imports



// Define table schema
export const email = pgTable("email", {
	// #region Primary & Foreign keys

	// Primary key, UUID, default to random
	id: uuid("id")
		.primaryKey()
		.defaultRandom(),

	// Foreign key from user
	userId: uuid("userId")
		.references(() => user.id,
			{ 
				onUpdate: "cascade",
				onDelete: "cascade"
			}
		)
		.notNull()
		.unique(),

	// #endregion Primary & Foreign keys



	// #region Secondary keys

	// Address, max length 320 chars
	address: varchar("address", { length: 320 })
		.notNull()
		.unique(),


	// Verified, default to false
	verified: boolean("verified")
		.default(false),
	
	// Verification code, UUID
	verificationCode: uuid("verificationCode")
		.unique(),

	// Code sent at, timestamp, precise to seconds
	codeSentAt: timestamp("codeSentAt", { mode: "date", precision: 0 })

	// #endregion Secondary keys
})

// Define Zod schemas
export const emailSelectSchema = createSelectSchema(email)

export const emailSafeSelectSchema = emailSelectSchema.omit({
	id: true,
	userId: true,
	verificationCode: true,
})

export const emailInsertSchema = createInsertSchema(email).omit({
	id: true,
	verified: true,
	verificationCode: true,
	codeSentAt: true
}).setKey("address", addressSchema)

export const emailPureInsertSchema = emailInsertSchema.omit({
	userId: true
})

export const emailUpdateSchema = createUpdateSchema(email).omit({
	id: true,
	userId: true
}).setKey("address", addressSchema)



// Define table relations
export const emailRelations = relations(email, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [email.userId],
		references: [user.id]
	})
}))