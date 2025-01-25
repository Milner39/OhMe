// #region Imports

import { defineConfig, mergeConfig, PluginOption } from "vite"
import { UserConfig as ViteConfig } from "vite"
import { tsRelativeAliasesToAbsolute } from "#utils/src/path-alias-utils"

// #endregion Imports



// #region Extras

const absoluteAliases = await tsRelativeAliasesToAbsolute()

// #endregion Extras



// Type options
type CreateConfigOptions = {
	aliases?: Record<string, string>,
	plugins?: PluginOption[]
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

	plugins: [
		...options?.plugins ?? []
	],

	resolve: {
		alias: {
			// Path aliases from tsconfig
			...absoluteAliases,

			// Extra path aliases
			...options?.aliases ?? {}
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