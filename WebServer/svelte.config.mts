// #region Imports

/*
	https://kit.svelte.dev/docs/adapters
	Import the correct adapter for Node servers
*/
import adapter from "@sveltejs/adapter-node"

// Import to get file paths
import { fromFileUrl } from "@std/path"

// Import package to get path aliases
// import packageJson from "../package.json" with { type: "json" }

// Import types
import type { Config } from "@sveltejs/kit"

// #endregion Imports



/*
	https://kit.svelte.dev/docs/configuration
	Define Svelte config
*/
const config = {
	kit: {
		adapter: adapter({
			// The directory to build the Node server
			out: fromFileUrl(new URL("./build", import.meta.url)),

			// Prefix for environment variables used by the Node server
			envPrefix: "NODE_SERVER_",
		}),

		// The directory for SvelteKit to write temp files and cache
		outDir: fromFileUrl(new URL("./.svelte-kit", import.meta.url)),
		
		env: {
			/*
				Prefix for environment variables that are safe/unsafe
				to expose client-side
			*/
			publicPrefix: "PUBLIC_",
			privatePrefix: ""
		},
		
		files: {
			appTemplate: fromFileUrl(new URL("./src/app.html", import.meta.url)),
			lib: fromFileUrl(new URL("./src/lib", import.meta.url)),
			assets: fromFileUrl(new URL("./src/lib/static", import.meta.url)),
			hooks: {
				client: fromFileUrl(new URL("./src/hooks", import.meta.url)),
				server: fromFileUrl(new URL("./src/hooks", import.meta.url)),
				universal: fromFileUrl(new URL("./src/hooks", import.meta.url))
			},
			params: fromFileUrl(new URL("./src/params", import.meta.url)),
			routes: fromFileUrl(new URL("./src/routes", import.meta.url)),
			serviceWorker: fromFileUrl(new URL("./src/service-worker", import.meta.url)),
		},

		// alias: packageJson.aliases,

		typescript: {} // Edit to extend `tsconfig.json`
	}
} satisfies Config

// Export Svelte config
export default config