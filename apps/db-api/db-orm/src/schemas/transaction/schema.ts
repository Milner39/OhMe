// #region Imports

import { pgTable, serial, uuid, numeric } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { 
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema
} from "drizzle-zod"

import { user } from "../user/schema"

// #endregion Imports



// Define table schema
export const transaction = pgTable("transaction", {
	// #region Primary & Foreign keys

	// Primary key, serial, default to auto increment
	id: serial("id")
		.primaryKey(),

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

	// Amount, numeric, 10 digits, 2 decimal places
	amount: numeric("amount", { precision: 10, scale: 2 })
		.notNull(),

	// #endregion Secondary keys
})

// Define Zod schemas
export const transactionSelectSchema = createSelectSchema(transaction)

export const transactionSafeSelectSchema = transactionSelectSchema.omit({
	id: true,
	userId: true
})

export const transactionInsertSchema = createInsertSchema(transaction).omit({
	id: true
})

export const transactionPureInsertSchema = transactionInsertSchema.omit({
	userId: true
})

export const transactionUpdateSchema = createUpdateSchema(transaction).omit({
	id: true,
	userId: true
})



// Define table relations
export const transactionRelations = relations(transaction, ({ one }) => ({
	// User relation
	user: one(user, {
		fields: [transaction.userId],
		references: [user.id]
	})
}))