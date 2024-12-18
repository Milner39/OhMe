// #region Imports

import { Hono } from "hono"

// #endregion Imports



// Subroutine to create basic router that can be mounted to main app
export const createRouter = () => {
	return new Hono({
        // Ignore trailing slashes
		strict: false
	})
}
