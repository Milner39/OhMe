// #region Imports

import { createConfig } from "#create-configs/src/vitest"

// #endregion Imports



// Create config
const config = createConfig(
	// Override
	{ cacheDir: "./.vite" },
	// Extend
	{}
)


// Export the Vitest config
export default config