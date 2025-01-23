// #region Imports

import { fileURLToPath, URL } from "node:url"

// #endregion Imports



// #region Utils

/** denoAliasesToAbsoluteAliases
 * 
 * Convert Deno path aliases to absolute path aliases.
 */
export const denoAliasesToAbsoluteAliases = (
	denoImports: Record<string, string>,
	denoFileURL: URL
) => {
	const absoluteAliases = Object.fromEntries(
		Object.entries(denoImports)
			// Filter out npm or jsr dependencies
			.filter((entry) => {
				return entry[1].startsWith(".")
			})

			// Map the entries to the correct format
			.map((entry) => {
				return [
					// Format the alias
					entry[0].slice(0, -1),

					// Get the absolute path
					fileURLToPath(new URL(entry[1], denoFileURL))
				]
			})
	)
	return absoluteAliases
}

// #endregion Utils