// #region Imports

import { defineConfig, mergeConfig, PluginOption } from "vite"
import { UserConfig as ViteConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// #endregion Imports



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
		// Path aliases from tsconfig
		tsconfigPaths(),
		...options?.plugins ?? []
	],

	resolve: {
		// Extra path aliases
		alias: {
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