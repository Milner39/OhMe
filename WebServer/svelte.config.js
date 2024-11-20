// #region Imports

/*
	https://svelte.dev/docs/kit/adapters
	Import the correct adapter for Node servers
*/
import adapter from "@sveltejs/adapter-node"

// Import to get file paths
import { fileURLToPath } from "node:url"

// #endregion Imports



/*
	https://svelte.dev/docs/kit/configuration
	Define Svelte config
*/
/** @type {import("@sveltejs/kit").Config} */
const config = {

	// SvelteKit settings
	kit: {
		adapter: adapter({
			// The directory to build the Node server
			out: fileURLToPath(new URL(
				"./build",
				import.meta.url
			)),

			// Prefix for environment variables used by the Node server
			envPrefix: "NODE_SERVER_",
		}),

		// The directory for SvelteKit to write temp files and cache
		outDir: fileURLToPath(new URL(
			"./.svelte-kit",
			import.meta.url
		)),
		
		env: {
			/*
				Prefix for environment variables that are safe/unsafe
				to expose client-side
			*/
			publicPrefix: "PUBLIC_",
			privatePrefix: ""
		},
		
		files: {
			appTemplate: fileURLToPath(new URL(
				"./src/app.html",
				import.meta.url
			)),
			lib: fileURLToPath(new URL(
				"./src/lib",
				import.meta.url
			)),
			assets: fileURLToPath(new URL(
				"./src/lib/static",
				import.meta.url
			)),
			hooks: {
				client: fileURLToPath(new URL(
					"./src/hooks.client",
					import.meta.url
				)),
				server: fileURLToPath(new URL(
					"./src/hooks.server",
					import.meta.url
				)),
				universal: fileURLToPath(new URL(
					"./src/hooks",
					import.meta.url
				))
			},
			params: fileURLToPath(new URL(
				"./src/params",
				import.meta.url
			)),
			routes: fileURLToPath(new URL(
				"./src/routes",
				import.meta.url
			)),
			serviceWorker: fileURLToPath(new URL(
				"./src/service-worker",
				import.meta.url
			)),
		},

		typescript: {
			config: (tsconfig) => { return tsconfig }
		} // Edit to extend `tsconfig.json`
	}

}

// Export Svelte config
export default config