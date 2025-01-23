// #region Imports

import { Context as HonoContext } from "hono"
import { HonoZValidatorResult } from "#utils/src/zod-utils"

import { KnownError } from "#utils/src/error-utils"
import { StandardResponseBody } from "#utils/src/response-utils"

// #endregion Imports



// #region Validation hooks

export const validateRequestHook = <
	ValidatorResult extends HonoZValidatorResult,
	Context extends HonoContext
> (
	result: ValidatorResult,
	context: Context
) => {
	if (!result.success) return context.json({
		result: null,
		error: new KnownError("Invalid request", {
			code: "InvalidRequest",
			target: result.error.issues
		})
	} satisfies StandardResponseBody, 422)
}

// #endregion Validation hooks