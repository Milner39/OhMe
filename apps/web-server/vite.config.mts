// #region Imports

import { createConfig } from "#create-configs/src/vite.ts"

/*
	https://vite.dev/guide/using-plugins
	Import SvelteKit plugin for Vite
*/
import { sveltekit as SvelteKit } from "@sveltejs/kit/vite"

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import to get environment variables
import env from "~web-server/env.ts"

// #endregion Imports



/*
	https://vite.dev/config/
	Define Vite config
*/
const config = createConfig(
	// Override
	{
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
			
			// https://github.com/sveltejs/kit/issues/2973
			fs: {
				allow: [
					fileURLToPath(new URL("../../", import.meta.url))
				]
			}
		},

		// Preview settings
		preview: {
			// Allows devices on same network to access the site
			host: true,

			// Host on specified port during preview
			port: env.PREV_PORT
		}
	},
	// Extend
	{}
)

export default config