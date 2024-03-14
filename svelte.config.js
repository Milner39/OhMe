import adapter from "@sveltejs/adapter-auto"

// Required to use scss instead of css for styling
import sveltePreprocess from "svelte-preprocess"

/** @type {import("@sveltejs/kit").Config} */
const config = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: adapter({
			// Controlls the prefix of the enviroment variables used in deployment
			envPrefix: "SERVER_"
		}),
		env: {
			// Controlls the prefix of the enviroment variables used in runtime
			publicPrefix: "PUBLIC_",
			privatePrefix: "PRIVATE_"
		}
	}
}
export default config
