// #region Imports

// #endregion Imports



// #region Utils

// Is record
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


// Type safe Object.entries
const tsObjectEntries = <T extends object>(
	object: T
): 
	{
		[K in keyof T]: [K, Exclude<T[K], undefined>]
	}[keyof T][] => 
{
	// @ts-ignore:
	return Object.entries(object)
}

// Type safe Object.keys
const tsObjectKeys = <T extends object>(
	object: T
): 
	{
		[K in keyof T]: K
	}[keyof T][] => 
{
	// @ts-ignore:
	return Object.keys(object)
}


// Keep keys
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

const keepKeys = <Target extends KKs_Target, Rule extends KKs_Rule>(
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

	// If target is not a record
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

// #endregion Utils



// #region Exports

export {
	isRecord,
	tsObjectEntries,
	tsObjectKeys,
	keepKeys
}

// #endregion Exports