// #region Imports
import { describe, test, expect } from "vitest"
import { stringHasher } from "$lib/server/utils/hashUtils.js"
// #endregion



// #region stringHasher
describe("stringHasher", async () => {

    const hash = await stringHasher.hash("Secret")

    describe("hash()", () => {
        test("Hashes a string and returns the hash", () => {
            expect(hash).toBeTypeOf("string")
        })
    })

    describe("verify()", () => {
        test("Returns `true` if given hash matches a given string if it is hashed with the same settings", async () => {
            expect(await stringHasher.verify(hash, "Not The Secret")).toBe(false)
            expect(await stringHasher.verify(hash, "Secret")).toBe(true)
        })
    })

    describe("failVerify()", () => {
        test("Simulates the time it takes to verify a hash and a string but always returns `false`", async () => {
            expect(await stringHasher.failVerify()).toBe(false)
        })
    })
})
// #endregion