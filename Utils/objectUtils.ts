// #region Imports

// #endregion Imports



// #region Utils

/** isRecord
 * 
 * Check if `target` is a record
 */
const isRecord = (
	target: unknown
): target is Record<
	string | number | symbol,
	unknown
> => {
	return (
		typeof target === "object" &&
		target !== null
	)
}


/** tsObjectEntries
 * 
 * Type safe Object.entries
 * 
 * Returns an array of key-value pairs from an object whilst retaining the type 
 * of the keys and values in the object.
 */
const tsObjectEntries = <
	Target extends object
> (
	target: Target
): 
	{
		[Key in keyof Target]: [Key, Exclude<Target[Key], undefined>]
	}[keyof Target][] =>
{
	// @ts-ignore:
	return Object.entries(target)
}

/** tsObjectKeys
 * 
 * Type safe Object.keys
 * 
 * Returns an array of keys from an object whilst retaining the type of the 
 * keys in the object.
 */
const tsObjectKeys = <
	Target extends object
> (
	target: Target
): 
	{
		[Key in keyof Target]: Key
	}[keyof Target][] => 
{
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
	Rule extends Record<string | number | symbol, unknown> ?
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
const keepKeys = <
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
	const result: Record<string | number | symbol, unknown> = {}

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

// #endregion Utils



// #region Exports

export {
	isRecord,
	tsObjectEntries,
	tsObjectKeys,
	keepKeys
}

// #endregion Exports