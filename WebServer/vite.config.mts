// #region Imports

/*
	https://vitejs.dev/guide/using-plugins
	Import SvelteKit plugin for Vite
*/
import { sveltekit as SvelteKit } from "@sveltejs/kit/vite"

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import dependencies to get environment variables
import dotenv from "dotenv"


// Import types
import type { UserConfig as Config } from "vite"

// #endregion Imports



// Load environment variables
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) })


/*
	https://vitejs.dev/config/
	Define Vite config
*/
const config = {

	// Vite settings
	cacheDir: fileURLToPath(new URL("./.vite", import.meta.url)),

	// Plugin configuration
	plugins: [
		SvelteKit(), // Currently no way to specify where the config file is
	],

	// Development settings
	server: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during development
		port: Number(Deno.env.get("DEV_PORT")) || 3000,
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
		port: Number(Deno.env.get("PREV_PORT")) || 3000,
		strictPort: true
	}

} satisfies Config


// Export Vite config
export default config