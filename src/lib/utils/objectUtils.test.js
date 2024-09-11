import { describe, test, expect, assert } from "vitest"
import { deepMerge, mapWithRule } from "./objectUtils.js"

describe("deepMerge", () => {
    describe("Replaces the values of each key in the first object with the values of the matching key in the second object", () => {
        test("Fails if the 'target' or 'source' argument are not type 'object' or are null", () => {
            assert.throws(() => deepMerge(0, {}))
            assert.throws(() => deepMerge({}, 0))
            assert.throws(() => deepMerge(0, 0))
            
            assert.throws(() => deepMerge(null, {}))
            assert.throws(() => deepMerge({}, null))
            assert.throws(() => deepMerge(null, null))
        })

        describe("Given all arguments are valid", () => {
            test("Existing keys in 'target' are replaced by the matching key in `source`", () => {
                const target = { 
                    a: "B"
                }
                const source = {
                    a: "A"
                }
                deepMerge(target, source) 
                expect(target).toEqual({
                    a: "A"
                })
            })

            test("Non-existing keys in 'target' are created with the value of the matching key in `source`", () => {
                const target = { 
                    a: "A"
                }
                const source = {
                    b: "B"
                }
                deepMerge(target, source)
                expect(target).toEqual({
                        a: "A",
                        b: "B"
                })
            })

            test("Keys in 'target' that values are type 'object' and are not null, can have their nested keys replaced by the matching nested key in 'source'", () => {
                const target = { 
                    a: {
                        b: "A"
                    }
                }
                const source = {
                    a: {
                        b: "B"
                    }
                }
                deepMerge(target, source)
                expect(target).toEqual({
                    a: {
                        b: "B"
                    }
                })
            })

            test("Keys in 'target' that are not type 'object' or are null, can be replaced with an object with nested keys in 'source'", () => {
                const target = { 
                    a: "A"
                }
                const source = {
                    a: {
                        b: "B"
                    }
                }
                deepMerge(target, source)
                expect(target).toEqual({
                    a: {
                        b: "B"
                    }
                })
            })

            test("'target' having circular references can be handled", () => {
                const target = {
                    a: "B",
                    b: "A",
                    ref: {}
                }
                target.ref = {
                    c: "C",
                    ref: target
                }
                const source = {
                    a: "A",
                    b: "B"
                }
                deepMerge(target, source)
                const expected = {
                    a: "A",
                    b: "B",
                    ref: {}
                }
                expected.ref = {
                    c: "C",
                    ref: expected
                }
                expect(target).toEqual(expected)
            })

            test("Keys adjacent to circular references in 'target' can be replaced", () => {
                const target = {
                    a: "B",
                    b: "A",
                    ref: {}
                }
                target.ref = {
                    c: "D",
                    d: "C",
                    ref: target
                }
                const source = {
                    a: "A",
                    b: "B",
                    ref: {
                        c: "C",
                        d: "D"
                    }
                }
                deepMerge(target, source)
                const expected = {
                    a: "A",
                    b: "B",
                    ref: {}
                }
                expected.ref = {
                    c: "C",
                    d: "D",
                    ref: expected
                }
                expect(target).toEqual(expected)
            })

            test("Keys in 'target' can be replaced by circular references in 'source'", () => {
                const target = {
                    a: "A",
                    ref: "Circle"
                }
                const source = {
                    a: "A",
                    ref: {}
                }
                source.ref = {
                    b: "B",
                    ref: source
                }
                deepMerge(target, source)
                const expected = {
                    a: "A",
                    ref: {}
                }
                expected.ref = {
                    b: "B",
                    ref: expected
                }
                expect(target).toEqual(expected)
            })
        })
    })
})

describe("mapWithRule", () => {
    describe("Maps a function to only the values of keys in the first object that are true in the second object", () => {
        test("Fails if the 'target' or 'rule' argument are not type 'object' or are null", () => {
            assert.throws(() => mapWithRule(0, {}, (value) => {return value}))
            assert.throws(() => mapWithRule({}, 0, (value) => {return value}))
            assert.throws(() => mapWithRule(0, 0, (value) => {return value}))
            
            assert.throws(() => mapWithRule(null, {}, (value) => {return value}))
            assert.throws(() => mapWithRule({}, null, (value) => {return value}))
            assert.throws(() => mapWithRule(null, null, (value) => {return value}))
        })
        test("Fails if the 'func' argument is not type 'function'", () => {
            assert.throws(() => mapWithRule({}, {}, null))
        })

        describe("Given all arguments are valid", () => {
            test("Only values of keys in the first object get replaced if the matching key in the second object is true", () => {
                const target = {
                    a: 2,
                    b: 3
                }
                const rule = {
                    a: true
                }
                const func = (value) => {
                    return value ** 2
                }
                mapWithRule(target, rule, func)
                expect(target).toEqual({
                    a: 4,
                    b: 3
                })
            })
        })
    })
})

// THEN THIS
// TODO: mapWithRule