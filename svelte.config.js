// #region Imports

/*
	https://kit.svelte.dev/docs/adapters
	Import the correct adapter for Node servers
*/
import adapter from "@sveltejs/adapter-node"

/*
	https://kit.svelte.dev/docs/integrations#preprocessors
	Import preprocessor to allow the use of scss
*/
import sveltePreprocess from "svelte-preprocess"

// #endregion



/*
	https://kit.svelte.dev/docs/configuration
	Define Svelte config
*/
/** @type {import("@sveltejs/kit").Config} */
const config = {
	preprocess: [
		sveltePreprocess()
	],
	kit: {
		adapter: adapter({
			// The directory to build the Node server
			out: "build",
			
			// Prefix for environment variables used by the Node server
			envPrefix: "NODE_SERVER_",
		}),

		// The directory for SvelteKit to write temp files and cache
		outDir: ".svelte-kit",

		env: {
			/*
				Prefix for environment variables that are safe/unsafe
				to expose client-side
			*/
			publicPrefix: "PUBLIC_",
			privatePrefix: ""
		},



		// Prevent scripts loading from external sites, stopping XSS attacks
		csp: {
			mode: "auto",
			directives: {
				"script-src": ["self"]
			}
		},

		// Check origin of requests, stopping CSRF attacks
		csrf: {
			checkOrigin: true
		}
	}
}

export default config