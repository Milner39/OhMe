// #region Imports

import { NotNull } from "@/packages/utils/src/type-utils.ts"
import { KnownError, SafeKnownError, KnownErrorCause } from "./error-utils.ts"

// #endregion Imports



// #region ResponseBody

export type StandardResponseBody = {
	result: NotNull
	error: null
} | {
	result: null,
	error: KnownError<KnownErrorCause>
}

export type SafeResponseBody = {
	result: NotNull
	error: null
} | {
	result: null,
	error: SafeKnownError<KnownErrorCause>
}

// #endregion ResponseBody