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

	static isKnownError(value: unknown): value is KnownError<KnownErrorCause> {
		return value instanceof KnownError
	}
}

export class SafeKnownError<
	Cause extends KnownErrorCause
> extends KnownError<Cause> {
	override stack: undefined

	constructor(
		message: string,
		cause: Cause
	) {
		super(message, cause)
	}

	static fromKnownError(knownError: KnownError<KnownErrorCause>) {
		return new SafeKnownError(knownError.message, knownError.cause)
	}
}

// #endregion KnownError