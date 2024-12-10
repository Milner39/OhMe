// deno-lint-ignore-file no-explicit-any

export const asLiteral = <T>(value: T): T => {
	return value
}

export const asLiteralTuple = <T extends [any]>(value: T): T => {
	return value
}


export type NotNull = 
	unknown &
	{ [key: string | number | symbol]: unknown } |
	undefined

export type MatchListLength<List extends any[], Type extends any> = {
	[Key in keyof List]: List[Key] extends any ? Type : never
}