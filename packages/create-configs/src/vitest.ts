// #region Imports

import { createConfig as createViteConfig } from "./vite.ts"

// Import Vitest
import { defineConfig, mergeConfig, configDefaults } from "vitest/config"
import type { ViteUserConfig as VitestConfig } from "vitest/config"

// #endregion Imports



// Type options
type CreateConfigOptions = {
	aliases?: Record<string, string>,
	test?: {
		exclude?: string[]
	}
}


/*
	https://vitest.dev/config/file.html
	Subroutine to create a default config
*/
const createDefaultConfig = (
	options?: CreateConfigOptions
): VitestConfig => mergeConfig(
	createViteConfig(undefined, options),
	defineConfig({
		test: {
			// Set env variables
			env: {
				"TESTING": "true"
			},

			// Set test files
			include: ["./**.test.ts"],
			exclude: [
				...configDefaults.exclude,
				...(options?.test?.exclude ?? [])
			]
		}
	})
)


// Subroutine to modify the default config
export const createConfig = (
	override: VitestConfig = {}, 
	extend?: CreateConfigOptions
): VitestConfig => mergeConfig(
	createDefaultConfig(extend),
	defineConfig(override)
)


// Export default config
export default createConfig()