// #region Imports

import { NotNull } from "@/packages/utils/src/type-utils.ts"
import { KnownError, KnownErrorCause } from "./error-utils.ts"

// #endregion Imports



// #region StandardResponseBody

export type StandardResponseBody = {
	result: NotNull
	error: null
} | {
	result: null,
	error: KnownError<KnownErrorCause>
}

// #endregion StandardResponseBody