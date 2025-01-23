import type { SafeSelectUserSession } from "~db-api/db-orm/src/db-ops/user.ts"

declare global {
	namespace App {
		interface Locals {
			// Remove any if type compatibility issues are fixed
			// Hover over type to see the problem
			userData: SafeSelectUserSession | null | any
		}
	}
}