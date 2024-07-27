// https://kit.svelte.dev/docs/adapters
// "Before you can deploy your SvelteKit app, you need to adapt it for your deployment target. 
//  Adapters are small plugins that take the built app as input and generate output for deployment."
// Import the correct adapter for Node servers
import adapter from "@sveltejs/adapter-node"

// https://kit.svelte.dev/docs/integrations#preprocessors
// "Preprocessors transform your .svelte files before passing them to the compiler."
// Import preprocessor to allow the use of scss
import sveltePreprocess from "svelte-preprocess"

// https://kit.svelte.dev/docs/configuration
// "As well as SvelteKit, this config object is used by other tooling that integrates with Svelte 
//  such as editor extensions."
// Define svelte config
const config = {
	preprocess: [
		sveltePreprocess()
	],
	kit: {
		adapter: adapter({
			// Controls the directory to build the server to
			out: "build",
			
			// Controls the prefix of the environment variables used by the Node server
			envPrefix: "NODE_SERVER_",
		}),

		// The directory that SvelteKit writes files to during dev and build
		outDir: ".svelte-kit",

		env: {
			// Controls the prefix of the environment variables used in runtime
			publicPrefix: "PUBLIC_",
			privatePrefix: "PRIVATE_"
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