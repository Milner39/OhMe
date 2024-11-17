// #region Imports

/*
	https://vitejs.dev/guide/using-plugins
	Import SvelteKit plugin for Vite
*/
import { sveltekit as SvelteKit } from "@sveltejs/kit/vite"

/*
	https://github.com/antfu/vite-plugin-restart?tab=readme-ov-file
	Import Vite plugin to restart the server when specified files change
*/
import ViteRestart from "vite-plugin-restart"

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

	// Vite settings
	cacheDir: fromFileUrl(new URL("./.vite", import.meta.url)),
	// root: fromFileUrl(new URL("../", import.meta.url)),
	// optimizeDeps: { force: true},

	// Plugin configuration
	plugins: [
		SvelteKit(), // Currently no way to specify where the config file is
		ViteRestart({ 
			restart: [
				"svelte.config.mts"
			]
		}) // Slow but works... sometimes
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
				fromFileUrl(new URL("../", import.meta.url))
			],
			strict: false
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