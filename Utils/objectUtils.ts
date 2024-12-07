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


// Keep keys
type KKs_Target = 
	unknown | 
	{
		[K: string | number]: KKs_Target 
	}

type KKs_Rule = 
	true | 
	{ 
		[K: string | number]: KKs_Rule
	}

const keepKeys = <Target extends KKs_Target>(
	target: Target,
	rule: KKs_Rule
): Partial<Target> => {

	// Base case, keep whole record
	if (rule === true) {
		// Return value not reference
		return structuredClone(target)
	}

	// If target is not a record
	if (!isRecord(target)) {
		throw new Error(
			`Cannot filter keys of target that is not a record: ${target}`
		)
	}


	// Define result record
	const result: Partial<Target> = {}

	// Iterate over rule keys
	for (const key of Object.keys(rule)) {

		// If key is not in target
		if (!(key in target)) {
			continue
		}
		const sharedKey = key as keyof Target // To reduce code repetition

		// If key should be kept
		if (rule[key] === true) {
			// Return value not reference
			result[sharedKey] = structuredClone(target[sharedKey])
		}

		else if (isRecord(rule[key])) {
			result[sharedKey] = keepKeys(
				target[sharedKey],
				rule[sharedKey]
			) as Target[keyof Target]
		}

	}

	return result
}

// #endregion Utils



// #region Exports

export {
	isRecord,
	keepKeys
}

// #endregion Exports