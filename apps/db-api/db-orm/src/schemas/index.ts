// Import table schemas
import { user, userRelations } from "./user/schema"
import { email, emailRelations } from "./email/schema"
import { password, passwordRelations } from "./password/schema"
import { session, sessionRelations } from "./session/schema"
import { transaction, transactionRelations } from "./transaction/schema"

// Export table schemas
export default {
	user, userRelations,
	email, emailRelations,
	password, passwordRelations,
	session, sessionRelations,
	transaction, transactionRelations,
}



// Import Zod schemas
import { 
	userSelectSchema, userSafeSelectSchema, userInsertSchema, userUpdateSchema
} from "./user/schema"
import { 
	emailSelectSchema, emailSafeSelectSchema, emailInsertSchema, emailPureInsertSchema, emailUpdateSchema
} from "./email/schema"
import { 
	passwordSelectSchema, passwordSafeSelectSchema, passwordInsertSchema, passwordPureInsertSchema, passwordUpdateSchema
} from "./password/schema"
import { 
	sessionSelectSchema, sessionSafeSelectSchema, sessionInsertSchema, sessionPureInsertSchema, sessionUpdateSchema
} from "./session/schema"
import {
	transactionSelectSchema, transactionSafeSelectSchema, transactionInsertSchema, transactionPureInsertSchema, transactionUpdateSchema
} from "./transaction/schema"

// Export Zod schemas
export const zodTableSchemas = {
	user: {
		select: userSelectSchema,
		safeSelect: userSafeSelectSchema,
		insert: userInsertSchema,
		update: userUpdateSchema
	},
	email: {
		select: emailSelectSchema,
		safeSelect: emailSafeSelectSchema,
		insert: emailInsertSchema,
		pureInsert: emailPureInsertSchema,
		update: emailUpdateSchema
	},
	password: {
		select: passwordSelectSchema,
		safeSelect: passwordSafeSelectSchema,
		insert: passwordInsertSchema,
		pureInsert: passwordPureInsertSchema,
		update: passwordUpdateSchema
	},
	session: {
		select: sessionSelectSchema,
		safeSelect: sessionSafeSelectSchema,
		insert: sessionInsertSchema,
		pureInsert: sessionPureInsertSchema,
		update: sessionUpdateSchema
	},
	transaction: {
		select: transactionSelectSchema,
		safeSelect: transactionSafeSelectSchema,
		insert: transactionInsertSchema,
		pureInsert: transactionPureInsertSchema,
		update: transactionUpdateSchema
	}
}