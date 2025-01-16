// #region Imports

// Validation
import { zValidator } from "@hono/zod-validator"
import { authIdsSchema } from "#validation/src/zod-schemas/index.ts"
import { transactionPureInsertSchema } from "~db-api/db-orm/src/schemas/transaction/schema.ts"
import { validateRequestHook } from "~db-api/server/src/lib/utils/response-utils.ts"

import { createRouter } from "~db-api/server/src/lib/create-router.ts"

import { safeCreate, safeReadMany } from "~db-api/db-orm/src/db-ops/transaction.ts"

import { KnownError } from "@/packages/utils/src/error-utils.ts";
import { StandardResponseBody } from "#utils/src/response-utils.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/transaction")
	// Define methods for this path
	.get(
		"/",
		zValidator("query", authIdsSchema, validateRequestHook),
		async (ctx) => {
			// Get request data
			const queries = ctx.req.valid("query")

			// Read transactions
			const readTransactionsRes = await safeReadMany(queries)

			// Check for errors
			if (readTransactionsRes.error !== null) {
				// Get error
				const error = readTransactionsRes.error


				// Create base response
				const baseBody = {
					result: null,
					error: new KnownError("Error reading transactions", {
						code: "UnknownServerError"
					})
				} satisfies StandardResponseBody
				const baseResponse = ctx.json(baseBody, 500)


				// Return failure if error is not a known error
				if (!(KnownError.isKnownError(error))) return baseResponse

				// Handle known errors
				switch (error.cause.code) {
					default:
						return baseResponse
				}
			}
			// Transactions have been read successfully after here


			// Get transactions
			const transactions = readTransactionsRes.result

			const resBody = {
				result: transactions,
				error: null
			} satisfies StandardResponseBody

			// Return success
			return ctx.json(resBody, 200)
		}
	)

	.post(
		"/",
		zValidator("query", authIdsSchema, validateRequestHook),
		zValidator("json", transactionPureInsertSchema, validateRequestHook),
		async (ctx) => {
			// Get request data
			const queries = ctx.req.valid("query")
			const body = ctx.req.valid("json")

			// Create transaction
			const createTransactionRes = await safeCreate({
				auth: queries,
				transaction: body
			})

			// Check for errors
			if (createTransactionRes.error !== null) {
				// Get error
				const error = createTransactionRes.error


				// Create base response
				const baseBody = {
					result: null,
					error: new KnownError("Error creating transaction", {
						code: "UnknownServerError" ,
					})
				} satisfies StandardResponseBody
				const baseResponse = ctx.json(baseBody, 500)


				// Return failure if error is not a known error
				if (!(KnownError.isKnownError(error))) return baseResponse
				
				// Handle known errors
				switch (error.cause.code) {
					case "IncorrectAuth":
						baseBody.error.message = "Incorrect authentication"
						baseBody.error.cause = error.cause
						return ctx.json(baseBody, 409)

					default:
						return baseResponse
				}
			}
			// Transaction has been created successfully after here
			
			
			// Get transaction
			const transaction = createTransactionRes.result

			const resBody = {
				result: transaction,
				error: null
			} satisfies StandardResponseBody

			// Return success
			return ctx.json(resBody, 201)
		}
	)


// Mount sub routes
const deepRouter = router
	// Mount static routes first
	// N/A

	// Mount dynamic routes
	// N/A


// Export router
export default deepRouter