// #region Imports

import { z, ZodError } from "zod"

// #endregion Imports



/** stringToJSON
 * 
 * Parses stringified JSON and returns the parsed object if successful
 * 
 * Full credit:
   https://github.com/colinhacks/zod/discussions/2215#discussioncomment-5356286
 */
export const stringToJSON = z.string().transform((str, ctx) => {
	try {
		return JSON.parse(str)
	} catch (_) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invalid JSON"
		})
		return z.NEVER
	}
})


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