// https://kit.svelte.dev/docs/adapters
// "Before you can deploy your SvelteKit app, you need to adapt it for your deployment target. 
//  Adapters are small plugins that take the built app as input and generate output for deployment."
// Import the correct adapter for Node servers
import adapter from "@sveltejs/adapter-node"

// https://kit.svelte.dev/docs/integrations#preprocessors
// "Preprocessors transform your .svelte files before passing them to the compiler."
//  Import preproceeser to allow the use of scss
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
			// Controlls the prefix of the enviroment variables used by the Node server
			envPrefix: "NODE_SERVER_"
		}),
		env: {
			// Controlls the prefix of the enviroment variables used in runtime
			publicPrefix: "PUBLIC_",
			privatePrefix: "PRIVATE_"
		}
	}
}
export default config