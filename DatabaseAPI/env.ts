// #region Imports

// Import to get environment variables
import dotenv from "dotenv"

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import to validate environment variables
import { z } from "zod"


// Import parent environment variables
import parentEnv from "../env.ts"

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
const { data: env, error } = envSchema.safeParse(Deno.env.toObject())

if (error) {
	console.error(error)
	Deno.exit(1)
}


// Merge with parent environment variables
const mergedEnv = { ...parentEnv, ...env! }


// Export environment variables and types
export default mergedEnv