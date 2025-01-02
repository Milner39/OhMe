// #region Imports

// Import to get path aliases
import rootDenoJson from "@/deno.json" with { type: "json" }
import { denoAliasesToAbsoluteAliases } from "#utils/src/deno-utils.ts"

// Import Vite
import { defineConfig, mergeConfig } from "vite"
import type { UserConfig as ViteConfig } from "vite"

// #endregion Imports



// Type options
type CreateConfigOptions = {
	aliases?: Record<string, string>,
}


/*
	https://vite.dev/config/
	Subroutine to create a default config
*/
const createDefaultConfig = (
	options?: CreateConfigOptions
): ViteConfig => defineConfig({
	// Cache directory
	cacheDir: "./.vite",

	resolve: {
		// Path aliases
		alias: {
			...denoAliasesToAbsoluteAliases(
				rootDenoJson.imports,
				new URL("../../../", import.meta.url)
			),
			...(options?.aliases ?? {})
		}
	},

	// Dev settings
	server: {
		strictPort: true
	},

	// Preview settings
	preview: {
		strictPort: true
	}
})


// Subroutine to modify the default config
export const createConfig = (
	override: ViteConfig = {},
	extend?: CreateConfigOptions
): ViteConfig => mergeConfig(
	createDefaultConfig(extend),
	defineConfig(override)
)


// Export default config
export default createConfig()