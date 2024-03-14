import { sveltekit } from "@sveltejs/kit/vite"

/** @type {import("vite").UserConfig} */
const config = {
	plugins: [
		sveltekit()
	],
	server: {
		// Allows devices on other networks to access the site
		host: true,
	}
}
export default config