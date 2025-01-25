// #region Imports

import { ZodError } from "zod"

// #endregion Imports



/** HonoZValidatorResult
 * 
 * The result from `zValidator` in `@hono/zod-validator`
 */
export type HonoZValidatorResult = {
	success: true,
	data: unknown
} | {
	success: false,
	data: unknown,
	error: ZodError
}