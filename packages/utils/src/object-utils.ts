// #region Imports

import { UnknownRecord } from "#utils/src/type-utils"

// #endregion Imports



// #region Utils

/** isRecord
 * 
 * Check if `target` is a record.
 */
export const isRecord = (
	target: unknown
): target is UnknownRecord => {
	return (
		typeof target === "object" &&
		target !== null
	)
}


/** tsObjectFromEntries
 * 
 * Type safe `Object.fromEntries`.
 * 
 * Returns an object created from key-value entries.
 */
export const tsObjectFromEntries = <
	const Entries extends [PropertyKey, unknown][]
> (
	entries: Entries
): {
	[Entry in Entries[number] as Entry[0]]: 
		Entry extends [PropertyKey, infer V] ? V : never
} => {
	// @ts-ignore:
	return Object.fromEntries(entries)
}

/** tsObjectEntries
 * 
 * Type safe `Object.entries`.
 * 
 * Returns an array of key-value pairs from an object whilst retaining the type 
 * of the keys and values in the object.
 */
export const tsObjectEntries = <
	const Target extends object
> (
	target: Target
): {
	[Key in keyof Target]: [Key, Target[Key]]
}[keyof Target][] => {
	// @ts-ignore:
	return Object.entries(target)
}

/** tsObjectKeys
 * 
 * Type safe `Object.keys`.
 * 
 * Returns an array of keys from an object whilst retaining the type of the 
 * keys in the object.
 */
export const tsObjectKeys = <
	const Target extends object
> (
	target: Target
): {
	[Key in keyof Target]: Key
}[keyof Target][] => {
	// @ts-ignore:
	return Object.keys(target)
}



// #region Keep keys

type KKs_Target = 
	unknown | 
	{
		[K: string | number]: KKs_Target 
	}

type KKs_Rule = 
	boolean | 
	{
		[K: string | number]: KKs_Rule
	}

type KKs_Filtered<Target, Rule> = Rule extends true ? 
	Target : 
	Rule extends UnknownRecord ?
		{ 
			[Key in keyof Rule & keyof Target]: 
			KKs_Filtered<Target[Key], Rule[Key]> 
		} :
		never


/** keepKeys
 * 
 * Returns an record based on the key-value pairs in the `target` record.
 * 
 * Key-value pairs are omitted if the key is not in the `rule` record.
 */
export const keepKeys = <
	Target extends KKs_Target,
	Rule extends KKs_Rule
> (
	target: Target,
	rule: Rule
): KKs_Filtered<Target, Rule> => {

	// Base case, keep whole record
	if (rule === true) {
		// Return value not reference
		return structuredClone(target) as KKs_Filtered<Target, Rule>
	} 
	else if (rule === false) {
		return {} as KKs_Filtered<Target, Rule>
	}

	// If `target` is not a record
	if (!isRecord(target)) {
		throw new Error(
			`Cannot filter keys of target that is not a record: ${target}`
		)
	}


	// Define result record
	const result: UnknownRecord = {}

	// Iterate over rule keys
	for (const key of Object.keys(rule)) {

		// If key is not in target
		if (!(key in target)) {
			continue
		}

		// If key should be kept
		if (rule[key] === true) {
			// Return value not reference
			result[key] = structuredClone(target[key])
		}

		// If key value is a record
		else if (isRecord(rule[key])) {
			// Recurse
			const subTarget = target[key]
			const subRule = rule[key]

			result[key] = keepKeys(subTarget, subRule)
		}

	}

	return result as KKs_Filtered<Target, Rule>
}

// #endregion Keep keys



// #region deepMerge

/** deepMerge
 * 
 * Returns a record based on the first record but recursively overridden with 
   the key-value pairs from the second record.
 * 
 */
export const deepMerge = (
	target: UnknownRecord | Array<unknown>,
	source: UnknownRecord | Array<unknown>,
	visited = new WeakMap()
): UnknownRecord | Array<unknown> => {

	// If `target` is not a record or array
	if (!(isRecord(target) || Array.isArray(target))) throw new Error(
		`Param target must be record or array, but got: ${typeof target}`
	)
	
	// If `source` is not a record or array
	if (!(isRecord(source) || Array.isArray(source))) throw new Error(
		`Param source must be record or array, but got: ${typeof source}`
	)

	// if `visited` is not a WeakMap
	if (!(visited instanceof WeakMap)) throw new Error(
		`Param visited must be WeakMap, but got: ${typeof visited}`
	)


	// If `source` is already in `visited`
	if (visited.has(source)) {
		// Return the value stored in `visited` at `source`
		return visited.get(source)
	}

	// Record `target` in `visited` at `source`
	visited.set(source, target)


	// Define result structure
	const result = Array.isArray(source) 
		? (Array.isArray(target) 
			? [...target] 
			: []
		) 
		: {...target}
		

	// Iterate over keys in `source`
	for (const key of Reflect.ownKeys(source)) {
		const unsafeKey = key as any

		const targetValue = target[unsafeKey]
		const sourceValue = source[unsafeKey]

		
		// If `source[key]` has already been visited
		if (visited.has(sourceValue as WeakKey)) {
			// Record the value stored in `visited` at `source[key]`
			result[unsafeKey] = visited.get(sourceValue as WeakKey)
		}

		// If `source[key]` is an array
		else if (Array.isArray(sourceValue)) {
			result[unsafeKey] = Array.isArray(targetValue) ?
				// If `target[key]` is an array
				// Recursively merge the arrays
				deepMerge(
					targetValue,
					sourceValue,
					visited
				) :

				// If `target[key]` is not an array
				sourceValue
		}

		// If `source[key]` is a record
		else if (isRecord(sourceValue)) {
			result[unsafeKey] = isRecord(targetValue) ?
				// If `target[key]` is a record
				// Recursively merge the records
				deepMerge(
					targetValue,
					sourceValue,
					visited
				) :

				// If `target[key]` is not a record
				sourceValue


		}

		// If `source[key]` is another value
		else {
			// Record the value
			result[unsafeKey] = sourceValue
		}
	}

	return result
}

// #endregion deepMerge

// #endregion Utils