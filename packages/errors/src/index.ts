// #region Imports

import { UnknownRecord } from "@/packages/utils/src/type-utils"
import { ErrorCode } from "./codes"

// #endregion Imports


type NullOrRecord<Record = UnknownRecord> = null | Record


/** KnownError
 * 
 * Base class for any error.
 */
export class KnownError<
	TCause extends NullOrRecord,
	TCode extends ErrorCode,
	TMessage extends string,
> {
	cause: TCause
	code: TCode
	message: TMessage

	constructor(cause: TCause, code: TCode, message: TMessage) {
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
export const createKnownErrorClass = <
	Parent extends typeof KnownError,
	DCode extends ErrorCode,
	DMessage extends string,
	Cause extends NullOrRecord = null,
>(
	parent: Parent,
	dCode: DCode,
	dMessage: DMessage,
) => {
	/*
		A mixin class must have a constructor with a single rest parameter of 
		type 'any[]'
	*/
	// @ts-ignore
	return class <
		TCause extends Cause,
		TCode extends ErrorCode = DCode,
		TMessage extends string = DMessage,
	> extends parent<
		TCause,
		TCode,
		TMessage
	> {
		constructor(
			cause: TCause,
			code: TCode = (dCode as unknown as TCode),
			message: TMessage = (dMessage as unknown as TMessage)
		) {
			super(
				cause,
				code,
				message
			)
		}
	}
}