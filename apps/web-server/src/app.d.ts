import type { SafeSelectFullUser } from "~db-api/db-orm/src/db-ops/user"

declare global {
	namespace App {
		interface Locals {
			userData: SafeSelectFullUser | null
		}
	}
}