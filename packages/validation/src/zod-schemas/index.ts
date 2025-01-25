// #region Imports

import { Validator } from "../index"
import { z } from "zod"

// #endregion Imports



// Initialize validator
const validator = new Validator()



// #region Zod Schemas

export const username = z.string().superRefine((val, ctx) => {
	const validate = validator.username(val)

	if (validate.result === false) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: validate.error
	})
})

export const password = z.string().superRefine((val, ctx) => {
	const validate = validator.password(val)

	if (validate.result === false) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: validate.error
	})

	// TODO: HASH BEFORE RETURNING
})

export const email = z.string().transform((val, ctx) => {
	const parsed = val.toLocaleLowerCase()
	const validate = validator.email(parsed)

	if (validate.result === false) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: validate.error
		})
		return z.NEVER
	}

	return parsed
})

export const uuid = z.string().superRefine((val, ctx) => {
	const validate = validator.uuid(val)

	if (validate.result === false) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: validate.error
	})
})



export const userRegisterSchema = z.object({
	username,
	email,
	password
})

export const userLoginSchema = userRegisterSchema.omit({
	email: true
})

export const authIdsSchema = z.object({
	userId: uuid,
	sessionId: uuid
})

// #endregion Zod Schemas