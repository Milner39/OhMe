import { UnknownRecord } from "@/packages/utils/src/type-utils"
import { ErrorCode } from "./codes"

// #region KnownError

// Base class for any error
export class KnownError<
	TCode extends ErrorCode,
	TCause = null | UnknownRecord
> {
	code: TCode
	message: string
	cause: TCause

	constructor(code: TCode, message: string, cause: TCause) {
		this.code = code
		this.message = message
		this.cause = cause
	}
}

// #endregion KnownError



////
class DBAPIError<
	TCode extends ErrorCode = ["db-api"],
	TCause = null
> extends KnownError<
	TCode,
	TCause
> {
	constructor(
		code: TCode = ["db-api"],
		message: string = "Error occurred in Database API",
		cause: TCause = null
	) {
		super(code, message, cause)
	}
}
////


////
class DBClientError<
	TCode extends ErrorCode = ["db-api","db-client"],
	TCause = null
> extends DBAPIError<
	TCode,
	TCause
> {
	constructor(
		code: TCode = ["db-api","db-client"],
		message: string = "Error occurred in Database Client",
		cause: TCause = null
	) {
		super(code, message, cause)
	}
}
////


const a = new DBAPIError()
const b = new DBClientError()

console.log(a instanceof DBAPIError)		// True
console.log(a instanceof DBClientError)		// False
console.log(b instanceof DBAPIError)		// True
console.log(b instanceof DBClientError)		// True