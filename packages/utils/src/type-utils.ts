// #region Utils

/** Enforce
 * 
 * Enforces that the first type satisfies the second.
 */
export type Enforce<Type extends Base, Base extends unknown> = Type

/** Mutable
 * 
 * Removes the `readonly` modifier from every property of an object.
 */
export type Mutable<Type> = {
	-readonly [Key in keyof Type]: Type[Key]
}

/** UnstrictEnum
 * 
 * Allows both enum values and string literals or numbers that match them
 */
export type UnstrictEnum<Enum extends string | number> = 
	Enum | Enum extends string 
	? `${Enum}`
	: Enum

/** asLiteralArray
 * 
 * Convert a list of values to a literal array retaining the types of the 
 * individual values.
 */
export const asLiteralArray = <
	const Targets extends any[]
> (
	...targets: Targets
): Targets => {
	return targets
}

/** UnknownRecord
 * 
 * A record with any of the standard keys but unknown values.
 */
export type UnknownRecord = Record<PropertyKey, unknown>

/** NotNull
 * 
 * Any type other than `null`.
 */
export type NotNull = 
	UnknownRecord |
	any[] |
	string |
	number |
	undefined

/** MatchListLength
 * 
 * An array of `Type`s with the same length as `List`.
 */
export type MatchListLength<List extends any[], Type extends any> = {
	[Key in keyof List]: List[Key] extends any ? Type : never
}

/** PartialKeysTrue<T> = {
 * 
 * A record with some of the keys of `Record` set to `true`.
 */
export type PartialKeysTrue<Record> = {
	[Key in keyof Record]?: true
}

// #endregion Utils