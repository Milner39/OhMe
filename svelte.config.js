// Import the correct adapter for node servers
import adapter from "@sveltejs/adapter-node"

// Required to use scss instead of css for styling
import sveltePreprocess from "svelte-preprocess"

// Define svelte config
const config = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: adapter({
			// Controlls the prefix of the enviroment variables used in deployment
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