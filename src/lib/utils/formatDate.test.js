import { describe, test, expect, assert } from "vitest"
import { formatDate } from "./formatDate"

describe("Returns the string value of a given 'Date' object in 'DD/MM/YYYY hh:mm:ss' format", () => {
    test("Fails if a 'date' argument is not valid 'Date' object", () => {
        assert.throws(() => formatDate(null))
    })

    describe("Given 'date' argument is valid 'Date' object", () => {
        test("Correct values extracted from 'date' argument", () => {
            const result = formatDate(new Date("November 10, 2024 16:20:30"))
            expect(result).toBe("10/11/2024 16:20:30")
        })
        test("Single digit values padded with a 0", () => {
            const result = formatDate(new Date("February 1, 2003 4:5:6"))
            expect(result).toBe("01/02/2003 04:05:06")
        })
    })
})