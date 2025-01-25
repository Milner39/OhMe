// #region Imports

import { describe, test, expect } from "vitest"

import { Validator, settings } from "#validation/src/index"

// #endregion Imports



const validator = new Validator()


// #region Tests

// #region Validator
describe("Validator", () => {
	// #region username()
	describe("username()", () => {
		const { minLen, maxLen } = settings.username
		describe(
			`
			Returns a result and an error depending on if a provided string is 
			a valid username.
			`.replace(/\s+/g, " "),
			() => {
				// #region results
				test("Username must be string", () => {
					
					const { result, error } = validator.username(null as any)

					expect(result).toBe(false)
					expect(error).toBeTypeOf("string")
				})

				test(`Username must be at least ${minLen} characters`, () => {
					expect(validator.username(
						"a".repeat(minLen -1)
					).result).toBe(false)

					expect(validator.username(
						"a".repeat(minLen)
					).result).toBe(true)

					expect(validator.username(
						"a".repeat(minLen +1)
					).result).toBe(true)
				})

				test(`Username must be at most ${maxLen} characters`, () => {
					expect(validator.username(
						"a".repeat(maxLen +1)
					).result).toBe(false)

					expect(validator.username(
						"a".repeat(maxLen)
					).result).toBe(true)

					expect(validator.username(
						"a".repeat(maxLen -1)
					).result).toBe(true)
				})

				test("Username must not start or end with whitespace", () => {
					expect(validator.username(
						"a".repeat(minLen)
					).result).toBe(true)

					expect(validator.username(
						" " + "a".repeat(minLen)
					).result).toBe(false)

					expect(validator.username(
						"a".repeat(minLen) + " "
					).result).toBe(false)

					expect(validator.username(
						" " + "a".repeat(minLen) + " "
					).result).toBe(false)
				})

				test("Username can contain whitespace between characters", () => {
					expect(validator.username(
						"a" + " ".repeat(minLen) + "a"
					).result).toBe(true)
				})
				// #endregion results
			}
		)
	})
	// #endregion username()

	// #region password()
	describe("password()", () => {
		const { minLen, maxLen } = settings.password
		describe(
			`
			Returns a result and an error depending on if a provided string is 
			a valid password.
			`.replace(/\s+/g, " "),
			() => {
				// #region results
				test("Password must be string", () => {
					
					const { result, error } = validator.password(null as any)

					expect(result).toBe(false)
					expect(error).toBeTypeOf("string")
				})

				test(`Password must be at least ${minLen} characters`, () => {
					expect(validator.password(
						"a".repeat(minLen -1)
					).result).toBe(false)

					expect(validator.password(
						"a".repeat(minLen)
					).result).toBe(true)

					expect(validator.password(
						"a".repeat(minLen +1)
					).result).toBe(true)
				})

				test(`Password must be at most ${maxLen} characters`, () => {
					expect(validator.password(
						"a".repeat(maxLen +1)
					).result).toBe(false)

					expect(validator.password(
						"a".repeat(maxLen)
					).result).toBe(true)

					expect(validator.password(
						"a".repeat(maxLen -1)
					).result).toBe(true)
				})

				test("Password must not start or end with whitespace", () => {
					expect(validator.password(
						"a".repeat(minLen)
					).result).toBe(true)

					expect(validator.password(
						" " + "a".repeat(minLen)
					).result).toBe(false)

					expect(validator.password(
						"a".repeat(minLen) + " "
					).result).toBe(false)

					expect(validator.password(
						" " + "a".repeat(minLen) + " "
					).result).toBe(false)
				})

				test("Password can contain whitespace between characters", () => {
					expect(validator.password(
						"a" + " ".repeat(minLen) + "a"
					).result).toBe(true)
				})
				// #endregion results
			}
		)
	})
	// #endregion password()

	// #region email()
	describe("email()", () => {
		const { maxLen } = settings.email
		describe(
			`
			Returns a result and an error depending on if a provided string is 
			a valid email.
			`.replace(/\s+/g, " "),
			() => {
				// #region results
				test("Email must be string", () => {
					
					const invalid = validator.email(null as any)
					expect(invalid.result).toBe(false)
					expect(invalid.error).toBeTypeOf("string")

					const valid = validator.email("example@domain.com")
					expect(valid.result).toBe(true)
					expect(valid.error).toBeNull()
				})

				test(`Email must be at most ${maxLen} characters`, () => {
					expect(validator.email(
						"a".repeat(maxLen +1 -11) + "@domain.com"
					).result).toBe(false)

					expect(validator.email(
						"a".repeat(maxLen -11) + "@domain.com"
					).result).toBe(true)

					expect(validator.email(
						"a".repeat(maxLen -1 -11) + "@domain.com"
					).result).toBe(true)
				})

				test("Email must not contain whitespace", () => {
					expect(validator.email(
						"e mail@outlook.com"
					).result).toBe(false)

					expect(validator.email(
						"email@out look.com"
					).result).toBe(false)
				})

				test("Email must contain 1 @ symbol", () => {
					expect(validator.email(
						"email.outlook.com"
					).result).toBe(false)

					expect(validator.email(
						"email@outlook.com"
					).result).toBe(true)

					expect(validator.email(
						"email@out@look.com"
					).result).toBe(false)
				})

				test("Allow special formats", () => {
					expect(validator.email(
						"example.email@domain.co.uk"
					).result).toBe(true)
				})

				test("Catch invalid emails", () => {
					expect(validator.email(
						"example..email@domain.co.uk"
					).result).toBe(false)

					expect(validator.email(
						"example.email.@domain.co.uk"
					).result).toBe(false)

					expect(validator.email(
						"example.email@.domain.co.uk"
					).result).toBe(false)

					expect(validator.email(
						"example.email@domain..co.uk"
					).result).toBe(false)
				})
				// #endregion results
			}
		)
	})
	// #endregion email()
})

// #endregion Validator

// #endregion Tests