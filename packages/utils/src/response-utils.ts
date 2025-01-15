// #region Imports

import { NotNull } from "@/packages/utils/src/type-utils.ts"
import { KnownError, SafeKnownError } from "./error-utils.ts"

// #endregion Imports



// #region ResponseBody

export type StandardResponseBody = {
	result: NotNull
	error: null
} | {
	result: null,
	error: KnownError
}

export type SafeResponseBody = {
	result: NotNull
	error: null
} | {
	result: null,
	error: SafeKnownError
}

// #endregion ResponseBody