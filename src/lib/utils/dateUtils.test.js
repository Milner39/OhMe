// #region Imports
import { describe, test, expect, assert } from "vitest"
import { format, dateFromNow } from "./dateUtils.js"
// #endregion



// #region format()
describe("format()", () => {
    describe("Returns the string value of a given `Date` object in 'DD/MM/YYYY hh:mm:ss' format", () => {
        test("Fails if `date` is not valid `Date` object", () => {
            assert.throws(() => format(null))
        })
    
        describe("Given `date` argument is valid `Date` object", () => {
            test("Correct values extracted from `date` argument", () => {
                const result = format(new Date("November 10, 2024 16:20:30"))
                expect(result).toBe("10/11/2024 16:20:30")
            })
            test("Single digit values padded with a 0", () => {
                const result = format(new Date("February 1, 2003 4:5:6"))
                expect(result).toBe("01/02/2003 04:05:06")
            })
        })
    })
})
// #endregion


// #region dateFromNow()
describe("dateFromNow()", () => {
    describe("Returns a `Date` object `difference`ms in the future", () => {
        test("Fails if `difference` is not type `number`", () => {
            assert.throws(() => dateFromNow(null))
        })

        describe("Given `difference` is type `number`", () => {
            test("Correct date returned", () => {
                const result = dateFromNow(24 * (60 ** 2) * 1000)

                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
        
                expect(result).toEqual(tomorrow)
            })
        })
    })
})
// #endregion