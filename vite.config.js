// Import sveltekit plugin for vite
import { sveltekit } from "@sveltejs/kit/vite"

// Define vite config
const config = {
	plugins: [
		sveltekit()
	],
	server: {
		// Allows devices on same network to access the site during development
		host: true,
	}
}
export default config