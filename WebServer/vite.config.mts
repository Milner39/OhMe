// #region Imports

/*
	https://vite.dev/guide/using-plugins
	Import SvelteKit plugin for Vite
*/
import { sveltekit as SvelteKit } from "@sveltejs/kit/vite"

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import to get environment variables
import env from "@/WebServer/env.ts"

// Import to get import aliases
import rootDenoJson from "@/deno.json" with { type: "json" }


// Import types
import type { UserConfig as Config } from "vite"

// #endregion Imports



/*
	Subroutine to get import aliases and format them for Vite so they can be 
	used by SvelteKit.
*/
const getImportAliases = () => {
	return Object.fromEntries(
		Object.entries(rootDenoJson.imports)
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



/*
	https://vite.dev/config/
	Define Vite config
*/
const config = {

	// Vite settings
	cacheDir: fileURLToPath(new URL("./.vite", import.meta.url)),
	resolve: {
		// Import aliases
		alias: {
			...getImportAliases()
		}
	},

	// Plugin configuration
	plugins: [
		SvelteKit(), // Currently no way to specify where the config file is
	],

	// Development settings
	server: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during development
		port: env.DEV_PORT,
		strictPort: true,
		
		// https://github.com/sveltejs/kit/issues/2973
		fs: {
			allow: [
				fileURLToPath(new URL("../", import.meta.url))
			]
		}
	},

	// Preview settings
	preview: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during preview
		port: env.PREV_PORT,
		strictPort: true
	}

} satisfies Config


// Export Vite config
export default config