// #region Imports

import { fileURLToPath, URL } from "node:url"

import { createConfig } from "../../packages/create-configs/src/vite"
import { sveltekit } from "@sveltejs/kit/vite"
import env from "./env"

// #endregion Imports



// Create config
const config = createConfig(
	// Override
	{
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
	{
		plugins: [
			sveltekit()
		]
	}
)

// Export the Vite config
export default config