// #region Imports

// #endregion Imports



// #region Extras

const containsWhitespace = (string: string) => /\s/.test(string)

// #endregion Extras



// #region Validator

type ValidatorResult = 
{
	result: true,
	error: null
} | {
	result: false,
	error: string
}

export const settings = {
	username: {
		minLen: 3,
		maxLen: 64
	},
	password: {
		minLen: 8,
		maxLen: 256
	},
	email: {
		maxLen: 320
	}
}

/** Validator
 * 
 * Validates several different types of user input
 */
export class Validator {
	username = (string: string): ValidatorResult => {
		let result = false
		const { minLen, maxLen } = settings.username

		// Checks
		if (typeof string !== "string") return {
			result,
			error: "Username must be a string"
		}

		else if (string.length < minLen) return {
			result,
			error: `Username must be at least ${minLen} characters`
		}
		else if (string.length > maxLen) return {
			result,
			error: `Username must be at most ${maxLen} characters`
		}

		else if (
			containsWhitespace(string[0] + string[string.length - 1])
		) return {
			result,
			error: "Username cannot start or end with a space"
		}

		// Success
		result = true
		return {
			result,
			error: null
		}
	}

	password = (string: string): ValidatorResult => {
		let result = false
		const { minLen, maxLen } = settings.password

		// Checks
		if (typeof string !== "string") return {
			result,
			error: "Password must be a string"
		}

		else if (string.length < minLen) return {
			result,
			error: `Password must be at least ${minLen} characters`
		}
		else if (string.length > maxLen) return {
			result,
			error: `Password must be at most ${maxLen} characters`
		}

		else if (
			containsWhitespace(string[0] + string[string.length - 1])
		) return {
			result,
			error: "Password cannot start or end with a space"
		}

		// Success
		result = true
		return {
			result,
			error: null
		}
	}

	email = (string: string): ValidatorResult => {
		let result = false
		const { maxLen } = settings.email
		const emailRegex = 
			/^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/

		// Checks
		if (typeof string !== "string") return {
			result,
			error: "Email must be a string"
		}

		else if (string.length > maxLen) return {
			result,
			error: `Email must be at most ${maxLen} characters`
		}

		else if (containsWhitespace(string)) return {
			result,
			error: "Email cannot contain a space"
		}
		else if (!string.includes("@")) return {
			result,
			error: "Email must contain 1 '@'"
		}
		else if (!emailRegex.test(string)) return {
			result,
			error: "Email is invalid"
		}


		// Success
		result = true
		return {
			result,
			error: null
		}
	}

	uuid = (string: string): ValidatorResult => {
		const uuidRegex = 
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

		// Checks
		const result = typeof string === "string" && uuidRegex.test(string)

		return result ? {
			result: true,
			error: null
		} : {
			result: false,
			error: "UUID is invalid"
		}
	}

	cost = (amount: number): ValidatorResult => {
		let result = false

		// Checks
		if (typeof amount !== "number") return {
			result,
			error: "Cost must be a number"
		}

		else if (amount < 0) return {
			result,
			error: "Cost cannot be negative"
		}

		else if (amount > 1_000_000) return {
			result,
			error: "Cost cannot be greater than 1,000,000"
		}

		// Success
		result = true
		return {
			result,
			error: null
		}
	}
}

// #endregion Validator