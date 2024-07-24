import { it, expect } from "vitest"
import { formatDate } from "./formatDate"

it("Returns the string value of a given 'Date' object in 'DD/MM/YYYY hh:mm:ss' format", () => {
    // Correct values returned from 'Date' object
    const resultA = formatDate(new Date("November 10, 2024 16:20:30"))
    expect(resultA).toBe("10/11/2024 16:20:30")

    // Single digit values padded with a 0
    const resultB = formatDate(new Date("February 1, 2003 4:5:6"))
    expect(resultB).toBe("01/02/2003 04:05:06")
})