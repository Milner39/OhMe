// #region Imports

import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { 
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema
} from "drizzle-zod"

import { user } from "../user/schema"

// #endregion Imports



// Define table schema
export const session = pgTable("session", {
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

	// Expires at, timestamp, precise to seconds
	expiresAt: timestamp("expiresAt", { mode: "date", precision: 0 })
		.notNull()

	// #endregion Secondary keys
})

// Define Zod schemas
export const sessionSelectSchema = createSelectSchema(session)

export const sessionSafeSelectSchema = sessionSelectSchema.omit({
	id: true,
	userId: true
})

export const sessionInsertSchema = createInsertSchema(session).omit({
	id: true
})

export const sessionPureInsertSchema = sessionInsertSchema.omit({
	userId: true
})

export const sessionUpdateSchema = createUpdateSchema(session).omit({
	id: true,
	userId: true
})



// Define table relations
export const sessionRelations = relations(session, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}))