// #region General Imports
import { describe, test, expect, assert } from "vitest"
import inputHandler from "./inputHandler.js"
// #endregion



// #region Validation
describe("validate", () => {
    describe("username()", () => {
        describe("Returns `false` if any requirements fail", () => {
            test("`input` is not type `string`", () => {
                const result = inputHandler.validate.username(null)
                expect(result).toBe(false)
            })
            test("`input` is 0 chars", () => {
                const result = inputHandler.validate.username("")
                expect(result).toBe(false)
            })
            test("`input` is too long", () => {
                const result = inputHandler.validate.username("i".repeat(51))
                expect(result).toBe(false)
            })
            test("`input` starts or ends in whitespace", () => {
                const inputs = [
                    " <-Whitespace",
                    "Whitespace-> ",
                    " <-Whitespace-> "
                ]
                const results = inputs.map(input => inputHandler.validate.username(input))
                expect(results).toEqual([false, false, false])
            })
        })
        test("Returns `true` if all requirements are met", () => {
            const result = inputHandler.validate.username("JohnDoe!")
            expect(result).toBe(true)
        })
    })

    describe("password()", () => {
        describe("Returns `false` if any requirements fail", () => {
            test("`input` is not type `string`", () => {
                const result = inputHandler.validate.password(null)
                expect(result).toBe(false)
            })
            test("`input` is too short chars", () => {
                const result = inputHandler.validate.password(8)
                expect(result).toBe(false)
            })
            test("`input` is too long", () => {
                const result = inputHandler.validate.password("i".repeat(257))
                expect(result).toBe(false)
            })
            test("`input` starts or ends in whitespace", () => {
                const inputs = [
                    " <-Whitespace",
                    "Whitespace-> ",
                    " <-Whitespace-> "
                ]
                const results = inputs.map(input => inputHandler.validate.password(input))
                expect(results).toEqual([false, false, false])
            })
        })
        test("Returns `true` if all requirements are met", () => {
            const result = inputHandler.validate.password("SecurePassword123")
            expect(result).toBe(true)
        })
    })

    describe("email()", () => {
        describe("Returns `false` if any requirements fail", () => {
            test("`input` is not type `string`", () => {
                const result = inputHandler.validate.email(null)
                expect(result).toBe(false)
            })
            test("`input` is too long", () => {
                const result = inputHandler.validate.email("i".repeat(320) +"@outlook.com")
                expect(result).toBe(false)
            })
            test("`input` starts or ends in whitespace", () => {
                const inputs = [
                    " example.address@outlook.com", 
                    "example.address@outlook.com ", 
                    " example.address@outlook.com "
                ]
                const results = inputs.map(input => inputHandler.validate.email(input))
                expect(results).toEqual([false, false, false])
            })
            test("`input` does not contain '@'", () => {
                const result = inputHandler.validate.email("example.address.outlook.com")
                expect(result).toBe(false)
            })
            test("`input` does not follow standard email format", () => {
                const result = inputHandler.validate.email("example.address.@outlook.c.o.m")
                expect(result).toBe(false)
            })
        })
        test("Returns `true` if all requirements are met", () => {
            const result = inputHandler.validate.email("example.address@outlook.com")
            expect(result).toBe(true)
        })
    })

    describe("uuid()", () => {
        describe("Returns `false` if any requirements fail", () => {
            test("`input` is not type `string`", () => {
                const result = inputHandler.validate.uuid(null)
                expect(result).toBe(false)
            })
            test("`input` does not follow standard uuid format", () => {
                const result = inputHandler.validate.uuid("aaaaaaaaaaaa-aaaa-1aaa-aaaa-aaaaaaaa")
                expect(result).toBe(false)
            })
        })
        test("Returns `true` if all requirements are met", () => {
            const result = inputHandler.validate.uuid("aaaaaaaa-aaaa-1aaa-aaaa-aaaaaaaaaaaa")
            expect(result).toBe(true)
        })
    })
})
// #endregion



// #region (De)Sanitization
    // #region Specific Imports
// Import settings
import { settings as allSettings } from "../settings"
const { sanitization: settings } = allSettings
    // #endregion



    // #region Sanitization
describe("sanitize()", () => {
    test("Fails if `input` is not type `string`", () => {
        assert.throws(() => inputHandler.sanitize(null))
    })

    describe("Given `input` is type `string`", () => {
        test("`char` indicating the start of a `code` is first to be sanitized", () => {
            const result = inputHandler.sanitize(
                settings.charCodes[0].char+
                settings.charCodes[1].char
            )
            expect(result).toBe(
                settings.charCodes[0].char+
                settings.charCodes[0].code.substring(1)+
                settings.charCodes[0].char+
                settings.charCodes[1].code.substring(1)
            )
            // To make sure "&#"
            // returns: "&amp&hsh"
            // not: "&amp&amphsh"
        })
        test.each(settings.charCodes)("Replaces $char with $code", ({char, code}) => {
            const result = inputHandler.sanitize(char)
            expect(result).toBe(code)
        })
        test("Sanitize a full string", () => {
            const result = inputHandler.sanitize("' or 1=1; --")
            expect(result).toBe("&sqt or 1&eql1&scn &dsh&dsh")
        })
    })
})
    // #endregion

    // #region Desanitization
describe("desanitize()", () => {
    test("Fails if `input` is not type `string`", () => {
        assert.throws(() => inputHandler.desanitize(null))
    })

    describe("Given `input` is type `string`", () => {
        test("`char` indicating the start of a `code` is last to be desanitized", () => {
            const result = inputHandler.desanitize(
                settings.charCodes[0].char+
                settings.charCodes[0].code.substring(1)+
                settings.charCodes[1].code.substring(1)
            )
            expect(result).toBe(
                settings.charCodes[0].char+
                settings.charCodes[1].code.substring(1)
            )
            // To make sure "&amphsh"
            // returns: "&hsh"
            // not: "&#"
        })
        test.each(settings.charCodes)("Replaces $code with $char", ({char, code}) => {
            const result = inputHandler.desanitize(code)
            expect(result).toBe(char)
        })
        test("Desanitize a full string", () => {
            const result = inputHandler.desanitize("&sqt or 1&eql1&scn &dsh&dsh")
            expect(result).toBe("' or 1=1; --")
        })
    })
})
    // #endregion
// #endregion