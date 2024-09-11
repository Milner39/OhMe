// https://vitejs.dev/guide/using-plugins
// Import sveltekit plugin for vite
import { sveltekit } from "@sveltejs/kit/vite"

// Import dotenv to get environment variables
import dotenv from "dotenv"
dotenv.config()

// https://vitejs.dev/config/
// Define vite config
const config = {
	plugins: [
		sveltekit()
	],

	// Development settings
	server: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during development
		port: process.env.DEV_PORT,
		strictPort: true
	},

	// Preview settings
	preview: {
		// Allows devices on same network to access the site
		host: true,

		// Host on specified port during preview
		port: process.env.PREV_PORT,
		strictPort: true
	}
}

export default config