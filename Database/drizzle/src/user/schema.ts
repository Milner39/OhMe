// #region Imports

// Import to create table and columns
import { pgTable, uuid, text } from "drizzle-orm/pg-core"

// Import to generate UUIDs
import crypto from "node:crypto"

// #endregion Imports



// Define table schema
export const user = pgTable("user", {
	id: uuid("id").primaryKey().$default(() => crypto.randomUUID()),
	username: text("username").notNull().unique(),
	email: text("email").notNull().unique()
})