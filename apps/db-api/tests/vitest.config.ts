// #region Imports

import { createConfig } from "#create-configs/src/vitest.ts"

// #endregion Imports



const config = createConfig(
	// Override
	{ cacheDir: "./.vite" },
	// Extend
	{}
)


// Export the Vitest config
export default config