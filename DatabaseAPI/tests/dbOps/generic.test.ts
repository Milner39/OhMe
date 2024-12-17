// #region Imports

import { describe, test, expect } from "vitest"

import {
	gCreate,
	gReadMany,
	gReadOne,
	gUpdateMany,
	gUpdateOne,
	gDeleteMany,
	gDeleteOne,
	gFindUniqueCollisions
} from "../../dbOps/generic.ts"

import db from "../../dbConnection.ts"
import { tables } from "../../dbUtils.ts"
import { PgTable } from "drizzle-orm/pg-core"
import { tsObjectEntries } from "../../../Utils/objectUtils.ts";


// Import types
import { InferSelectModel } from "drizzle-orm"
import { asLiteralArray, MatchListLength } from "../../../Utils/typeUtils.ts"

// #endregion Imports



// Reset db before running tests
for (const table of tsObjectEntries(tables)) {
	if (table[1] instanceof PgTable) {
		await db.delete(table[1])
	}
}



// #region Tests

const values = [
	{ username: "test1" },
	{ username: "test2" },
	{ username: "test3" }
] as const

// #region gCreate
describe("gCreate()", () => {
	describe(
		`Creates rows in the table based on the array of values provided`,
		() => {
			// #region results
			test("Creates rows in the table", async () => {

				const { result } = await gCreate(
					tables.user,
					asLiteralArray(...values)
				)

				expect(result).not.toBeNull()
				if (result === null) return

				expect(result).toHaveLength(values.length)

				values.forEach((partialRow, i) => {
					expect(result[i].username).toEqual(partialRow.username)
				})
			})
			// #endregion
		}
	)
})
// #endregion

// #region gReadMany
describe("gReadMany()", () => {
	describe(
		`Reads rows from the table based on the filter`,
		() => {
			// #region results
			test("Read rows from the table", async () => {

				const { result } = await gReadMany(tables.user,
					(query) => query
				)


				expect(result).not.toBeNull()
				if (result === null) return

				// @ts-ignore:
				const typedResult = result as MatchListLength<
					// @ts-ignore:
					typeof values, InferSelectModel<typeof tables.user>
				>


				values.forEach((partialRow, i) => {
					expect(typedResult[i].username).toEqual(partialRow.username)
				})
			})



			test("Read rows from the table with a filter", async () => {

				const { result } = await gReadMany(tables.user,
					(query) => query
						.filter((user, { or, eq }) => or(
							eq(user.username, "test1"),
							eq(user.username, "test2")
						))
				)


				expect(result).not.toBeNull()
				if (result === null) return

				// @ts-ignore:
				const typedResult = result as 
					InferSelectModel<typeof tables.user>[]

				const usernames = typedResult.map(row => row.username)


				expect(usernames).toContain("test1")
				expect(usernames).toContain("test2")
			})
			// #endregion
		}
	)
})
// #endregion

// #region gReadOne
describe("gReadOne()", () => {
	describe(
		`Reads a row from the table based on the filter`,
		() => {
			// #region results
			test("Read a row from the table", async () => {

				const { result } = await gReadOne(tables.user,
					(query) => query
						.filter((user, { eq }) => eq(user.username, "test1"))
				)


				expect(result).not.toBeNull()
				if (result === null) return

				const typedResult = result as 
					InferSelectModel<typeof tables.user>


				expect(typedResult.username).toEqual("test1")
			})


			test("Returns error if no rows are found", async () => {

				const { error } = await gReadOne(tables.user,
					(query) => query
						.filter((user, { eq }) => eq(user.username, "test4"))
				)

				expect(error).not.toBeNull()
			})


			test("Returns error if multiple rows are found", async () => {

				const { error } = await gReadOne(tables.user,
					(query) => query
				)

				expect(error).not.toBeNull()
			})
			// #endregion
		}
	)
})
// #endregion

// #region gUpdateMany
describe("gUpdateMany()", () => {
	describe(
		`Updates rows in the table based on the filter`,
		() => {
			// #region results
			test("Updates rows in the table", async () => {

				const { result } = await gUpdateMany(tables.user,
					{ web3Address: "0x123" },
					(user, { or, eq }) => or(
						eq(user.username, "test1"),
						eq(user.username, "test2")
					)
				)


				expect(result).not.toBeNull()
				if (result === null) return

				// @ts-ignore:
				const typedResult = result as 
					InferSelectModel<typeof tables.user>[]

				const usernames = typedResult.map(row => row.username)


				expect(usernames).toEqual(["test1", "test2"])

				typedResult.forEach(row => {
					expect(row.web3Address?.trim()).toEqual("0x123")
				})
			})

			// TODO: Add more tests
		}
	)
})
// #endregion

// #region gDeleteMany
describe("gDeleteMany()", () => {
	describe(
		`Deletes rows from the table based on the filter`,
		() => {
			// #region results
			test("Deletes rows from the table", async () => {

				const { result } = await gDeleteMany(tables.user,
					(user, { or, eq }) => or(
						eq(user.username, "test2"),
						eq(user.username, "test3")
					)
				)


				expect(result).not.toBeNull()
				if (result === null) return

				// @ts-ignore:
				const typedResult = result as 
					InferSelectModel<typeof tables.user>[]

				const usernames = typedResult.map(row => row.username)


				expect(usernames).toContain("test2")
				expect(usernames).toContain("test3")
			})

			// TODO: Add more tests
		}
	)
})
// #endregion

// #region gGetUniqueCollisions
describe("gGetUniqueCollisions()", () => {
	describe(
		`
		Returns the unique columns from the table that already have the values 
		passed in
		`.replace(/\s+/g, " "),
		() => {
			// #region results
			test("Returns the unique columns with existing values", async () => {

				const { result } = await gFindUniqueCollisions(tables.user,
					{ username: "test1" }
				)


				expect(result).not.toBeNull()
				if (result === null) return


				expect(result).toEqual(["username"])
			})

			// TODO: Add more tests
		}
	)
})

// #endregion Tests