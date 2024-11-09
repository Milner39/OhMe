// #region Imports

/*
	https://vitejs.dev/guide/using-plugins
	Import SvelteKit plugin for Vite
*/
import { svelte } from "@sveltejs/vite-plugin-svelte"

// Import `path` to get file paths
import { fileURLToPath, URL } from "node:url"

// Import dependencies to get environment variables
import dotenv from "dotenv"
import process from "node:process"

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
	plugins: [
		svelte({ 
			configFile: fileURLToPath(new URL("./svelte.config.ts", import.meta.url))
		})
	],

	// Development settings
	server: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during development
		port: Number(process.env.DEV_PORT) || 3000,
		strictPort: true
	},

	// Preview settings
	preview: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during preview
		port: Number(process.env.PREV_PORT) || 3000,
		strictPort: true
	}
} satisfies Config


// Export Vite config
export default config