// deno-lint-ignore-file no-explicit-any

// #region Utils

/** asLiteralArray
 * 
 * Convert a list of values to a literal array retaining the types of the 
 * individual values.
 */
const asLiteralArray = <
	Targets extends any[]
> (
	...targets: Targets
): Targets => {
	return targets
}

/** NotNull
 * 
 * Any type other than `null`.
 */
type NotNull = 
	unknown &
	{ [key: string | number | symbol]: unknown } |
	undefined

/** MatchListLength
 * 
 * An array of `Type`s with the same length as `List`.
 */
type MatchListLength<List extends any[], Type extends any> = {
	[Key in keyof List]: List[Key] extends any ? Type : never
}

// #endregion Utils



// #region Exports

export {
	asLiteralArray
}

export type {
	NotNull,
	MatchListLength
}

// #endregion Exports