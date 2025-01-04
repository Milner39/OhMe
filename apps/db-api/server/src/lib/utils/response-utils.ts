// #region Imports

import type { NotNull } from "@/packages/utils/src/type-utils.ts"
import type { KnownErrorCause } from "~db-api/utils/error-utils.ts"

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