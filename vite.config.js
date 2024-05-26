// https://vitejs.dev/guide/using-plugins
// Import sveltekit plugin for vite
import { sveltekit } from "@sveltejs/kit/vite"

// Import dotenv to get enviroment variables
import dotenv from "dotenv"

// Load enviroment variables
dotenv.config()

// https://vitejs.dev/config/
// Define vite config
const config = {
	plugins: [
		sveltekit()
	],

	// Development settings
	server: {
		// Allows devices on same network to access the site?
		host: true,

		// Host on specified port during development
		port: process.env.DEV_PORT,
		strictPort: true,

		// Automatically open the app in the browser on server start?
		open: false,
		// "/example" to open on specified route

		// Warm up files to transform and cache the results in advance
		warmup: {
			clientFiles: [],
			ssrFiles: ["./src/lib/server/*.js"]
		}
	},

	// Preview settings
	preview: {
		// Allows devices on same network to access the site?
		host: true,

		// Host on specified port during preview
		port: process.env.PREV_PORT,
		strictPort: true,

		// Automatically open the app in the browser on server start?
		open: false
		// "/example" to open on specified route
	}
}

export default config