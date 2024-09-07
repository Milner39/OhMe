// https://kit.svelte.dev/docs/adapters
// Import the correct adapter for Node servers
import adapter from "@sveltejs/adapter-node"

// https://kit.svelte.dev/docs/configuration
// Define Svelte config
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// The directory to build the Node server
			out: "build"
		}),

		// The directory for SvelteKit to write temp files and cache
		outDir: ".svelte-kit",
	}
}

export default config