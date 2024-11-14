// #region Imports

/*
	https://vitejs.dev/guide/using-plugins
	Import SvelteKit plugin for Vite
*/
import { svelte } from "@sveltejs/vite-plugin-svelte"

// Import to get file paths
import { fromFileUrl } from "@std/path"

// Import dependencies to get environment variables
import dotenv from "dotenv"

// Import types
import type { UserConfig as Config } from "vite"

// #endregion Imports



// Load environment variables
dotenv.config({ path: fromFileUrl(new URL("./.env", import.meta.url)) })


/*
	https://vitejs.dev/config/
	Define Vite config
*/ 
const config = {
	// Plugin configuration
	plugins: [
		svelte({ 
			configFile: fromFileUrl(new URL("./svelte.config.mts", import.meta.url))
		})
	],

	// Cache directory
	cacheDir: fromFileUrl(new URL("./.vite", import.meta.url)),

	// Development settings
	server: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during development
		port: Number(Deno.env.get("DEV_PORT")) || 3000,
		strictPort: true
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