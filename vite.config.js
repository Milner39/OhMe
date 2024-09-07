// https://vitejs.dev/guide/using-plugins
// Import SvelteKit plugin for Vite
import { sveltekit } from "@sveltejs/kit/vite"

// https://vitejs.dev/config/
// Define Vite config
/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit()
	],

	// Development settings
	server: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during development
		port: 4522,
		strictPort: true
	},

	// Preview settings
	preview: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during preview
		port: 4523,
		strictPort: true
	}
}

export default config