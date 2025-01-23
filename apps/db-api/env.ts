// #region Imports

import * as process from "node:process"
import { fileURLToPath, URL } from "node:url"

import * as dotenv from "dotenv"
import { z } from "zod"


// Import parent environment variables
import parentEnv from "@/env"

// #endregion Imports



// Load environment variables
dotenv.config({
	path: fileURLToPath(new URL("./.env", import.meta.url))
})


// Create a schema for environment variables
const envSchema = z.object({
	DATABASE_URL: z.string().url(),

	TESTING: z.coerce.boolean().default(false),
	TEST_DATABASE_URL: z.string().url().optional(),
}).superRefine((input, ctx) => {
	if (input.TESTING && !input.TEST_DATABASE_URL) {
		ctx.addIssue({
			code: z.ZodIssueCode.invalid_type,
			expected: "string",
			received: "undefined",
			path: ["TEST_DATABASE_URL"],
			message: "TEST_DATABASE_URL is required when TESTING is true"
		})
	}
})


// Validate environment variables
const { data: env, error } = envSchema.safeParse(process.env)
if (error) {
	console.error("Incorrect env options:", error)
	process.exit(1)
}


// Merge with parent environment variables
const mergedEnv = { ...parentEnv, ...env! }

// Export environment variables
export default mergedEnv