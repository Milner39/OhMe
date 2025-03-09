// #region Imports

import { UnknownRecord } from "@/packages/utils/src/type-utils"
import { ErrorCode } from "./codes"

// #endregion Imports


type NullOrAnyRecord = null | UnknownRecord


/** KnownError
 * 
 * Base class for any error.
 */
export class KnownError<
	TCode extends ErrorCode,
	TCause extends NullOrAnyRecord
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



/** createKnownErrorClass
 * 
 * A class factory which generates classes that:
 * - Extend instances of `KnownError`
 * - Set their own properties to the provided defaults when instantiated
 * - Set their own properties to constructor arguments if provided
 * 
 * This is useful because it allows long chains of inheritance to be created,
   while maintaining type safety and without repeating lots of code.
 *
 * Values/Types prefixed with `D` are defaults.
 * 
 * Values/Types prefixed with `T` are used in the generated class.
 */
const createKnownErrorClass = <
	Parent extends typeof KnownError,
	DCode extends ErrorCode,
	DCause extends NullOrAnyRecord
>(
	parent: Parent,
	dCode: DCode,
	dMessage: string,
	dCause: DCause
) => {
	/*
		A mixin class must have a constructor with a single rest parameter of 
		type 'any[]'
	*/
	// @ts-ignore
	return class <
		TCode extends ErrorCode = DCode,
		TCause extends NullOrAnyRecord = DCause
	> extends parent<
		TCode,
		TCause
	> {
		constructor(
			code: TCode = (dCode as unknown as TCode),
			message: string = dMessage,
			cause: TCause = (dCause as unknown as TCause)
		) {
			super(code, message, cause)
		}
	}
}


const DBAPIError = createKnownErrorClass(
	KnownError,
	["db-api"],
	"Error occurred in Database API",
	null
)

const DBORMError = createKnownErrorClass(
	DBAPIError,
	["db-api","db-orm"],
	"Error occurred in Database ORM Client",
	null
)