// #region Imports

// Import to create table and columns
import { pgTable, text } from "drizzle-orm/pg-core"

// Import to generate UUIDs
import crypto from "node:crypto"

// #endregion Imports



// Define table schema
export const user = pgTable("user", {
	id: text("id").primaryKey().$default(() => crypto.randomUUID()),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique()
})