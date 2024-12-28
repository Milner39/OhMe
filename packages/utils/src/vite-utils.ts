// #region Imports

import { fileURLToPath } from "node:url"

// #endregion Imports



// #region Utils

/** denoAliasesToViteAliases
 * 
 * Convert Deno path aliases to Vite path aliases.
 */
export const denoAliasesToViteAliases = (
	denoImports: Record<string, string>,
	denoFileURL: URL
) => {
	const viteAliases = Object.fromEntries(
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
	return viteAliases
}

// #endregion Utils