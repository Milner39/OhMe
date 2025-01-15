// #region KnownError

export type KnownErrorCause = {
	code: string,
	target?: unknown
}

export class KnownError<
	Cause extends KnownErrorCause = KnownErrorCause
> extends Error {
	override cause: Cause

	constructor(
		message: string,
		cause: Cause
	) {
		super(message)
		this.cause = cause
	}

	static isKnownError(value: unknown): value is KnownError {
		return value instanceof KnownError
	}
}

export class SafeKnownError<
	Cause extends KnownErrorCause = KnownErrorCause
> extends KnownError<Cause> {
	override stack: undefined

	constructor(
		message: string,
		cause: Cause
	) {
		super(message, cause)
	}

	static fromKnownError(knownError: KnownError) {
		return new SafeKnownError(knownError.message, knownError.cause)
	}
}

// #endregion KnownError