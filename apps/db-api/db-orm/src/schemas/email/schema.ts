// #region Imports

// Import to create table, columns, and relations
import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Import to create Zod schemas
import { 
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema 
} from "drizzle-zod"

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

export const emailSafeSelectSchema = createSelectSchema(email).omit({
	id: true,
	userId: true,
	verificationCode: true,
})

export const emailInsertSchema = createInsertSchema(email).omit({
	id: true
})

export const emailUpdateSchema = createUpdateSchema(email).omit({
	id: true,
	userId: true
})



// Define table relations
export const emailRelations = relations(email, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [email.userId],
		references: [user.id]
	})
}))