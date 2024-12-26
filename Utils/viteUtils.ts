// #region Imports

import { fileURLToPath } from "node:url"

// #endregion Imports



// #region Utils

/** denoAliasesToViteAliases
 * 
 * Convert Deno path aliases to Vite path aliases.
 */
export const denoAliasesToViteAliases = (
	denoImports: Record<string, string>
) => {
	return Object.fromEntries(
		Object.entries(denoImports)
			// Filter out npm or jsr dependencies
			.filter((entry) => {
				return entry[1].startsWith(".")
			})

			// Map the entries to the correct format
			.map((entry) => {
				// Get the path relative to this file
				const relativePath = "../" + entry[1]

				return [
					// Format the alias
					entry[0].slice(0, -1),

					// Get the absolute path
					fileURLToPath(new URL(relativePath, import.meta.url))
				]
			})
	)
}

// #endregion Utils