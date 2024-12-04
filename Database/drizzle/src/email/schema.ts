// #region Imports

// Import to create table, columns, and relations
import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Import other table schemas
import { user } from "../user/schema.ts"

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
		.notNull(),

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
	verificationCode: uuid("verificationCode"),

	// Code sent at, timestamp, precise to seconds
	codeSentAt: timestamp("codeSentAt", { mode: "date", precision: 0 })

	// #endregion Secondary keys
})

// Define table relations
export const emailRelations = relations(email, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [email.userId],
		references: [user.id]
	})
}))