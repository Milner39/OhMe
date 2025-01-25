// #region Imports

import { fileURLToPath, URL } from "node:url"

import { z } from "zod"

// #endregion Imports



// #region Extras

/** removeFromEnd
 * 
 * Remove `strToRemove` from the end of `targetStr`, only if `strToRemove` is 
   present.
 */
const removeFromEnd = (targetStr, strToRemove) => {
	// Escape special regex chars
	const escapedPattern = strToRemove.replace(
		/[.*+?^=!:${}()|\[\]\/\\&]/g,
		"\\$&"
	)

	// Create regex to match the end of `targetStr`
	const regex = new RegExp(`${escapedPattern}$`)

	// Remove `strToRemove` from the end of `targetStr` if it was found.
	return targetStr.replace(regex, "")
}

// #endregion Extras



// #region Utils

const tsConfigPathsFileSchema = z.object({
	compilerOptions: z.object({
		baseUrl: z.string(),
		paths: z.record(
			z.union([z.string(), z.array(z.string())])
		)
	})
})

/** tsRelativeAliasesToAbsolute
 * 
 * Convert path aliases defined in tsconfig files at `compilerOptions.paths` to 
   absolute aliases that can be used by build tools like Vite.
 * 
 * This will only format aliases correctly if the tsconfig aliases are 
   formatted correctly too.
 */
export const tsRelativeAliasesToAbsolute = async (
	fileURL = new URL("../../../tsconfig.paths.json", import.meta.url)
) => {
	// Import the tsconfig file
	const tsconfigF = tsConfigPathsFileSchema.parse(
		(await import(fileURL.href, { with: { type: "json" } })).default
	)

	// Get the relative aliases
	const relativeAliases = tsconfigF.compilerOptions.paths

	// Get the absolute aliases
	const absoluteAliases = Object.fromEntries(
		Object.entries(relativeAliases)
			.map((entry) => {
				return [
					// Format the alias
					removeFromEnd(entry[0], "/*"),

					// Get absolute path
					fileURLToPath(new URL(
						removeFromEnd(Array.isArray(entry[1]) ?
							entry[1][0] : entry[1]
							, "*"
						),
						fileURL
					))
				]
			})
	)
	return absoluteAliases
}

// #endregion Utils