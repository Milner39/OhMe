// #region Imports

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import to get path aliases
import rootDenoJson from "@/deno.json" with { type: "json" }

// Import to convert Deno path aliases to Vite path aliases
import { denoAliasesToViteAliases } from "#utils/src/vite-utils.ts"


// Import types
import type { ViteUserConfig } from "vitest/config"

// #endregion Imports



/*
	https://vitest.dev/config/file.html
	Define Vitest config
*/
const config = {

	// Vite settings
	cacheDir: fileURLToPath(new URL("../.vite", import.meta.url)),
	resolve: {
		// Path aliases
		alias: denoAliasesToViteAliases(
			rootDenoJson.imports,
			new URL("../../../", import.meta.url)
		)
	},

	test: {
		// Set env variables
		env: {
			"TESTING": "true"
		},

		// Set test files
		include: ["./**.test.ts"],
	}
} satisfies ViteUserConfig


// Export the Vitest config
export default config