// #region Imports

// Import types
import type { ViteUserConfig } from "vitest/config"

// #endregion Imports



/*
	https://vitest.dev/config/file.html
	Define Vitest config
*/
const config = {
	test: {
		// Set env variables
		env: {
			"TESTING": "true"
		},

		// Set test files
		include: ["./**.test.ts"],
	}
} satisfies ViteUserConfig


// Export the Vitest config
export default config