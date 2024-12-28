// #region Imports

// Import to create table, columns, and relations
import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Import other table schemas
import { user } from "../user/schema.ts"

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
		.notNull()
		.unique(),

	// #endregion Primary & Foreign keys



	// #region Secondary keys

	// Expires at, timestamp, precise to seconds
	expiresAt: timestamp("expiresAt", { mode: "date", precision: 0 })
		.notNull()

	// #endregion Secondary keys
})

// Define table relations
export const sessionRelations = relations(session, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}))