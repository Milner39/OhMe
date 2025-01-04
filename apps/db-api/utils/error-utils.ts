// #region KnownError

export type KnownErrorCause = {
	code: string,
	target?: unknown
}

export class KnownError<
	Cause extends KnownErrorCause
> extends Error {
	override cause: Cause

	constructor(
		message: string,
		cause: Cause
	) {
		super(message)
		this.cause = cause
	}
}

// #endregion KnownError