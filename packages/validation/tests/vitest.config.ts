// #region Imports

import { createConfig } from "#create-configs/src/vitest"

// #endregion Imports



const config = createConfig(
	// Override
	{ cacheDir: "./tests/.vite" },
	// Extend
	{}
)

export default config