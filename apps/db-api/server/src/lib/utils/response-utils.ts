// #region Imports

import { KnownError } from "#utils/src/error-utils.ts"
import { StandardResponseBody } from "#utils/src/response-utils.ts"

import { Context as HonoContext } from "hono"
import { HonoZValidatorResult } from "#utils/src/zod-utils.ts"

// #endregion Imports




// #region Validation hooks

export const validateJsonHook = <
	ValidatorResult extends HonoZValidatorResult,
	Context extends HonoContext
> (
	result: ValidatorResult,
	context: Context
) => {
	if (!result.success) return context.json({
		result: null,
		error: new KnownError("Invalid request body", {
			code: "InvalidRequestBody",
			target: result.error.issues
		})
	} satisfies StandardResponseBody, 422)
}

// #endregion Validation hooks