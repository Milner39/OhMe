// #region Imports

import { Hono } from "hono"

// #endregion Imports



// Subroutine to create basic router that can be mounted onto main app
export const createRouter = () => {
	return new Hono({
		// Ignore trailing slashes
		strict: false
	})
}
