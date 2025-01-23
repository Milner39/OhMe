// #region Imports

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { 
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema
} from "drizzle-zod"
import {
	password as rawPasswordSchema
} from "#validation/src/zod-schemas/index"

import { user } from "../user/schema"

// #endregion Imports



// Define table schema
export const password = pgTable("password", {
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

	// Hash, length depends on hashing settings
	hash: text("hash")
		.notNull(),

	
	// Reset code, UUID
	resetCode: uuid("resetCode")
		.unique(),

	// Code sent at, timestamp, precise to seconds
	codeSentAt: timestamp("codeSentAt", { mode: "date", precision: 0 })

	// #endregion Secondary keys
})

// Define Zod schemas
export const passwordSelectSchema = createSelectSchema(password)

export const passwordSafeSelectSchema = passwordSelectSchema.omit({
	id: true,
	userId: true,
	hash: true,
	resetCode: true,
})

export const passwordInsertSchema = createInsertSchema(password).omit({
	id: true,
	resetCode: true,
	codeSentAt: true
}).setKey("hash", rawPasswordSchema)

export const passwordPureInsertSchema = passwordInsertSchema.omit({
	userId: true
})

export const passwordUpdateSchema = createUpdateSchema(password).omit({
	id: true,
	userId: true
}).setKey("hash", rawPasswordSchema)



// Define table relations
export const passwordRelations = relations(password, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [password.userId],
		references: [user.id]
	})
}))