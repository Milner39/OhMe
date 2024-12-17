// #region Imports

// Import to get file paths
import { fileURLToPath } from "node:url"

// Import to get environment variables
import dotenv from "dotenv"

// #endregion Imports



export const loadAllDotenvs = () => {
	// Define relative paths to .env files
	const relativePaths = [
		"./.env",
		"../.env"
	]

	// Load environment variables from all .env files
	for (const relativePath of relativePaths) {
		dotenv.config({ 
			path: fileURLToPath(new URL(relativePath, import.meta.url))
		})
	}
}