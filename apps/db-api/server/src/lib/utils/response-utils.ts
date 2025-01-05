// #region Imports

import { NotNull } from "@/packages/utils/src/type-utils.ts"
import { KnownErrorCause } from "~db-api/utils/error-utils.ts"

import { Context as HonoContext } from "hono"
import { HonoZValidatorResult } from "#utils/src/zod-utils.ts"

// #endregion Imports



// #region StandardResponseBody

export type StandardResponseBody = {
	result: NotNull
	error: null
} | {
	result: null,
	error: {
		message: string
		cause: KnownErrorCause
	}
}

// #endregion StandardResponseBody



// #region Validation hooks

export const validateJSONHook = <
	ValidatorResult extends HonoZValidatorResult,
	Context extends HonoContext
> (
	result: ValidatorResult,
	context: Context
) => {
	if (!result.success) return context.json({
		result: null,
		error: {
			message: "Invalid request body",
			cause: {
				code: "InvalidRequestBody",
				target: result.error.issues
			},
		}
	} satisfies StandardResponseBody, 422)
}

// #endregion Validation hooks