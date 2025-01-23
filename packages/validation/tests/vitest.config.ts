// #region Imports

import { createConfig } from "#create-configs/src/vitest.ts"

// #endregion Imports



const config = createConfig(
	// Override
	{ cacheDir: "./tests/.vite" },
	// Extend
	{}
)

export default config