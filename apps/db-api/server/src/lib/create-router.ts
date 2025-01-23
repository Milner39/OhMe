// #region Imports

import { Hono } from "hono"

// #endregion Imports



// Create basic router that can be mounted onto main app
export const createRouter = () => {
	return new Hono({
		// Ignore trailing slashes
		strict: false
	})
}
