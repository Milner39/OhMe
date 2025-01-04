// Import table schemas
import { user, userRelations } from "./user/schema.ts"
import { email, emailRelations } from "./email/schema.ts"
import { password, passwordRelations } from "./password/schema.ts"
import { session, sessionRelations } from "./session/schema.ts"

// Export table schemas
export default {
	user, userRelations,
	email, emailRelations,
	password, passwordRelations,
	session, sessionRelations
}



// Import Zod schemas
import { 
	userSelectSchema, userSafeSelectSchema,userInsertSchema,userUpdateSchema
} from "./user/schema.ts"
import { 
	emailSelectSchema, emailSafeSelectSchema, emailInsertSchema, emailUpdateSchema
} from "./email/schema.ts"
import { 
	passwordSelectSchema, passwordSafeSelectSchema, passwordInsertSchema, passwordUpdateSchema
} from "./password/schema.ts"
import { 
	sessionSelectSchema, sessionSafeSelectSchema, sessionInsertSchema, sessionUpdateSchema
} from "./session/schema.ts"

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
		update: emailUpdateSchema
	},
	password: {
		select: passwordSelectSchema,
		safeSelect: passwordSafeSelectSchema,
		insert: passwordInsertSchema,
		update: passwordUpdateSchema
	},
	session: {
		select: sessionSelectSchema,
		safeSelect: sessionSafeSelectSchema,
		insert: sessionInsertSchema,
		update: sessionUpdateSchema
	}
}