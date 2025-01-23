// #region Imports

import { describe, test, expect } from "vitest"

import { filterUniqueColumns } from "~db-api/db-orm/src/db-utils.ts"
import tables from "~db-api/db-orm/src/schemas/index.ts"

// #endregion Imports



// #region Tests

// #region filterUniqueColumns
describe("filterUniqueColumns()", () => {
	describe(
		`
		Returns a record based on the values with only the unique columns of 
		the table
		`.replace(/\s+/g, " "),
		() => {
			// #region results
			test("Only returns unique columns", () => {
				const partialEmailRow = {
					id: "",
					userId: "",
					address: "",
					verified: false,
					verificationCode: "",
					codeSentAt: new Date()
				}

				const result = filterUniqueColumns(
					partialEmailRow, 
					tables.email
				)

				expect(result).toEqual({
					id: "",
					userId: "",
					address: "",
					verificationCode: ""
				})
			})

			
			test("Omit null values", () => {
				const partialEmailRow = {
					verificationCode: null,
					codeSentAt: null
				}

				const result = filterUniqueColumns(
					partialEmailRow,
					tables.email
				)

				expect(result).toEqual({})
			})
			// #endregion
		}
	)
})

// #endregion

// #endregion Tests