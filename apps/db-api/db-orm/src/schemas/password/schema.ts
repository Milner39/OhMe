// #region Imports

// Import to create table, columns, and relations
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Import other table schemas
import { user } from "../user/schema.ts"

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

// Define table relations
export const passwordRelations = relations(password, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [password.userId],
		references: [user.id]
	})
}))