// Import table schemas
import { user, userRelations } from "./user/schema.ts"
import { email, emailRelations } from "./email/schema.ts"
import { password, passwordRelations } from "./password/schema.ts"

// Export table schemas
export default {
	user,
	userRelations,
	email,
	emailRelations,
	password,
	passwordRelations
}