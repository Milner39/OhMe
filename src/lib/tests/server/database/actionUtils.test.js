// #region Imports
import { describe, test, expect, assert } from "vitest"
import { collapseDBActionDataRecord } from "$lib/server/database/actions/utils.js"
// #endregion Imports



// #region collapseDBActionDataRecord
describe("collapseDBActionDataRecord", () => {
    describe("Collapses data records into only the fields", () => {
        // #region Arguments
        test("Fails if `target` or `rule` are not type `object` or are null", () => {
            assert.throws(() => collapseDBActionDataRecord(0))
            assert.throws(() => collapseDBActionDataRecord(null))
        })
        // #endregion Arguments


        // #region Results
        describe("Given all arguments are valid", () => {
            test("Returns the collapsed record", () => {
                const data = {
                    username: "example",
                    email: {
                        _: { 
                            address: "example",
                            verifyCode: "example"
                        }
                    },
                    password: {
                        _: { hash: "example" }
                    }
                }
        
                const collapsedData = collapseDBActionDataRecord(data)
        
                expect(collapsedData).toEqual({
                    username: "example",
                    email: {
                        address: "example",
                        verifyCode: "example"
                    },
                    password: { hash: "example" }
                })
            })
        })
        // #endregion Results
    })
})
// #endregion collapseDBActionDataRecord