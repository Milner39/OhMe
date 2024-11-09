// #region Imports
import { describe, test, expect, assert } from "vitest"
import { 
    isPlainObject,
    deleteKeys,
    keepKeys,
    checkKeyMatch,
    deepMerge,
    mapWithRule,
    splitKeysIntoArray,
    getDotNotation 
} from "$lib/client/utils/objectUtils.js"
// #endregion



// #region isPlainObject()
describe("isPlainObject()", () => {
    describe("Checks if an object is a plain object", () => {
        // #region Results
        test("Primitive types", () => {
            expect(isPlainObject(0)).toEqual(false)
            expect(isPlainObject("")).toEqual(false)
            expect(isPlainObject(true)).toEqual(false)
        })

        test("Null, Undefined", () => {
            expect(isPlainObject(null)).toEqual(false)
            expect(isPlainObject(undefined)).toEqual(false)
        })

        test("Non-plain objects", () => {
            expect(isPlainObject([])).toEqual(false)
            expect(isPlainObject(new Date())).toEqual(false)
        })
        // #endregion
    })
})
// #endregion



// #region deleteKeys()
describe("deleteKeys()", () => {
    describe("Deletes only the keys in the first object that are true in the second object", () => {
        // #region Arguments
        test("Fails if `target` or `rule` are not type `object` or are null", () => {
            assert.throws(() => deleteKeys(0, {}))
            assert.throws(() => deleteKeys({}, 0))
            assert.throws(() => deleteKeys(0, 0))
            
            assert.throws(() => deleteKeys(null, {}))
            assert.throws(() => deleteKeys({}, null))
            assert.throws(() => deleteKeys(null, null))
        })
        // #endregion


        // #region Results
        describe("Given all arguments are valid", () => {
            // #region Basic Deletes
            describe("Basic Deletes", () => {
                test("Only values of keys the `target` get deleted if the matching key in `rule` is true", () => {
                    const target = {
                        a: "A",
                        b: "B"
                    }
                    const rule = {
                        a: true
                    }
                    deleteKeys(target, rule)
                    expect(target).toEqual({
                        b: "B"
                    })
                })
            })
            // #endregion


            // #region Nested Objects
            describe("Nested Objects", () => {
                test("Keys in `target` that values are type `object` and are not null, can have their nested keys deleted", () => {
                    const target = {
                        a: {
                            b: "B",
                            c: "C"
                        }
                    }
                    const rule = {
                        a: {
                            b: true
                        }
                    }
                    deleteKeys(target, rule)
                    expect(target).toEqual({
                        a: {
                            c: "C"
                        }
                    })
                })
            })
            // #endregion
        })
        // #endregion
    })
})
// #endregion



// #region keepKeys()
describe("keepKeys()", () => {
    describe("Keeps only the keys in the first object that are true in the second object", () => {
        // #region Arguments
        test("Fails if `target` or `rule` are not type `object` or are null", () => {
            assert.throws(() => keepKeys(0, {}))
            assert.throws(() => keepKeys({}, 0))
            assert.throws(() => keepKeys(0, 0))
            
            assert.throws(() => keepKeys(null, {}))
            assert.throws(() => keepKeys({}, null))
            assert.throws(() => keepKeys(null, null))
        })
        // #endregion


        // #region Results
        describe("Given all arguments are valid", () => {
            // #region Basic Deletes
            describe("Basic Deletes", () => {
                test("Only values of keys the `target` get kept if the matching key in `rule` is true", () => {
                    const target = {
                        a: "A",
                        b: "B"
                    }
                    const rule = {
                        a: true
                    }
                    keepKeys(target, rule)
                    expect(target).toEqual({
                        a: "A"
                    })
                })
            })
            // #endregion


            // #region Nested Objects
            describe("Nested Objects", () => {
                test("Keys in `target` that values are type `object` and are not null, can have their nested keys kept", () => {
                    const target = {
                        a: {
                            b: "B",
                            c: "C"
                        }
                    }
                    const rule = {
                        a: {
                            b: true
                        }
                    }
                    keepKeys(target, rule)
                    expect(target).toEqual({
                        a: {
                            b: "B"
                        }
                    })
                })
            })
            // #endregion
        })
        // #endregion
    })
})
// #endregion



// #region checkKeyMatch()
describe("checkKeyMatch()", () => {
    describe("Check if the keys in one object equal the value of the matching keys in another object", () => {
        // #region Arguments
        test("Fails if `actual` or `expected` are not type `object` or are null", () => {
            assert.throws(() => checkKeyMatch(0, {}))
            assert.throws(() => checkKeyMatch({}, 0))
            assert.throws(() => checkKeyMatch(0, 0))
            
            assert.throws(() => checkKeyMatch(null, {}))
            assert.throws(() => checkKeyMatch({}, null))
            assert.throws(() => checkKeyMatch(null, null))
        })
        // #endregion


        // #region Results
        describe("Given all arguments are valid", () => {
            // #region Basic Matches
            describe("Basic Matches", () => {
                test("Returns `true` if the keys in `expected` equal the value of the matching keys in `actual`", () => {
                    const target = {
                        a: "A",
                        b: "B"
                    }
                    const check = {
                        a: "A"
                    }
                    expect(checkKeyMatch(target, check)).toEqual(true)
                })
    
                test("Returns `false` if the keys in `expected` do not equal the value of the matching keys in `actual`", () => {
                    const target = {
                        a: "A",
                        b: "B"
                    }
                    const check = {
                        a: "B"
                    }
                    expect(checkKeyMatch(target, check)).toEqual(false)
                })

                test("Multiple keys can be checked at once", () => {
                    const target = {
                        a: "A",
                        b: "B",
                        c: "C"
                    }
                    const check = {
                        a: "A",
                        c: "C"
                    }
                    expect(checkKeyMatch(target, check)).toEqual(true)
                })
            })
            // #endregion


            // #region Nested Objects
            describe("Nested Objects", () => {
                test("Keys in `actual` that values are type `object` and are not null, can have their nested keys checked", () => {
                    const target = {
                        a: {
                            b: "B",
                            c: "C"
                        }
                    }
                    const check = {
                        a: {
                            b: "B"
                        }
                    }
                    expect(checkKeyMatch(target, check)).toEqual(true)
                })
    
                test("Keys in `actual` that are not type `object` or are null, can be checked with an object with nested keys in `expected`", () => {
                    const target = {
                        a: "A"
                    }
                    const check = {
                        a: {
                            b: "B"
                        }
                    }
                    expect(checkKeyMatch(target, check)).toEqual(false)
                })
            })
            // #endregion
        })
        // #endregion
    })
})
// #endregion



// #region deepMerge()
describe("deepMerge()", () => {
    describe("Replaces the values of each key in the first object with the values of the matching key in the second object", () => {
        // #region Arguments
        test("Fails if `target` or `source` are not type `object` or are null", () => {
            assert.throws(() => deepMerge(0, {}))
            assert.throws(() => deepMerge({}, 0))
            assert.throws(() => deepMerge(0, 0))
            
            assert.throws(() => deepMerge(null, {}))
            assert.throws(() => deepMerge({}, null))
            assert.throws(() => deepMerge(null, null))
        })

        test ("Fails if `visited` is not `WeakMap` object", () => {
            assert.throws(() => deepMerge({}, {}, null))
        })
        // #endregion


        // #region Results
        describe("Given all arguments are valid", () => {
            // #region Basic Merges
            describe("Basic Merges", () => {
                test("Existing keys in `target` are replaced by the matching key in `source`", () => {
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
    
                test("Non-existing keys in `target` are created with the value of the matching key in `source`", () => {
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
            })
            // #endregion


            // #region Nested Objects
            describe("Nested Objects", () => {
                test("Keys in `target` that values are type `object` and are not null, can have their nested keys replaced by the matching nested key in `source`", () => {
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
    
                test("Keys in `target` that are not type `object` or are null, can be replaced with an object with nested keys in `source`", () => {
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
            })
            // #endregion


            // #region Arrays
            describe("Arrays", () => {
                test("Keys in `target` that values are `Array` objects can have their items replaced by the matching items in `source`", () => {
                    const target = {
                        alphabet: ["a", "b", "c"]
                    }
                    const source = {
                        alphabet: ["x", "y", "z"]
                    }
                    deepMerge(target, source)
                    expect(target).toEqual({
                        alphabet: ["x", "y", "z"]
                    })
                })

                test("Keys in `target` that are not `Array` objects can be replaced with an `Array` object in the matching key in `source`", () => {
                    const target = {
                        a: "apple"
                    }
                    const source = {
                        a: ["a", "p", "p", "l", "e"]
                    }
                    deepMerge(target, source)
                    expect(target).toEqual({
                        a: ["a", "p", "p", "l", "e"]
                    })
                })

                test("Keys in `target` that values are `Array` objects can have their items replaced by nested `Array` objects in `source`", () => {
                    const target = {
                        words: ["sea", "sky"]
                    }
                    const source = {
                        words: [
                            ["s", "e", "a"],
                            ["s", "k", "y"]
                        ]
                    }
                    deepMerge(target, source)
                    expect(target).toEqual({
                        words: [
                            ["s", "e", "a"],
                            ["s", "k", "y"]
                        ]
                    })
                })
            })
            // #endregion


            // #region Circular References
            describe("Circular References", () => {
                test("`target` having circular references can be handled", () => {
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
    
                test("Keys adjacent to circular references in `target` can be replaced", () => {
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
    
                test("Keys in `target` can be replaced by circular references in `source`", () => {
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
            // #endregion
        })
        // #endregion
    })
})
// #endregion


// #region mapWithRule()
describe("mapWithRule()", () => {
    describe("Maps a function to only the values of keys in the first object that are true in the second object", () => {
        // #region Arguments
        test("Fails if `target` or `rule` are not type `object` or are null", () => {
            assert.throws(() => mapWithRule(0, {}, (value) => {return value}))
            assert.throws(() => mapWithRule({}, 0, (value) => {return value}))
            assert.throws(() => mapWithRule(0, 0, (value) => {return value}))
            
            assert.throws(() => mapWithRule(null, {}, (value) => {return value}))
            assert.throws(() => mapWithRule({}, null, (value) => {return value}))
            assert.throws(() => mapWithRule(null, null, (value) => {return value}))
        })

        test("Fails if `func` is not type `function`", () => {
            assert.throws(() => mapWithRule({}, {}, null))
        })
        // #endregion


        // #region Results
        describe("Given all arguments are valid", () => {
            // #region Basic Maps
            describe("Basic Maps", () => {
                test("Only values of keys the `target` get mapped if the matching key in `rule` is true", () => {
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
    
                test("Non-existing keys in `target` are created with the value `func(undefined)`", () => {
                    const target = {
                        a: "Hello world!"
                    }
                    const rule = {
                        b: true
                    }
                    const func = (value) => {
                        if (typeof value === "undefined") return "Hello null!"
                    }
                    mapWithRule(target, rule, func)
                    expect(target).toEqual({
                        a: "Hello world!",
                        b: "Hello null!"
                    })
                })
            })
            // #endregion


            // #region Nested Objects
            describe("Nested Objects", () => {
                test("Keys in `target` that values are type `object` and are not null, can have their nested keys mapped", () => {
                    const target = {
                        a: {
                            b: "C"
                        }
                    }
                    const rule = {
                        a: {
                            b: true
                        }
                    }
                    const func = (value) => {
                        return value.toLowerCase()
                    }
                    mapWithRule(target, rule, func)
                    expect(target).toEqual({
                        a: {
                            b: "c"
                        }
                    })
                })

                test("Non-existing keys in `target` are created as a nested object if key in `rule` is a nested object", () => {
                    const target = {
                        a: 419
                    }
                    const rule = {
                        a: true,
                        b: {
                            c: true
                        }
                    }
                    const func = (value) => {
                        if (typeof value === "undefined") return 0
                        return value + 1
                    }
                    mapWithRule(target, rule, func)
                    expect(target).toEqual({
                        a: 420,
                        b: {
                            c: 0
                        }
                    })
                })
            })
            // #endregion
        })
        // #endregion
    })
})
//#endregion


// #region splitKeysIntoArray()
describe("splitKeysIntoArray()", () => {
    describe("Split an object into an array where each non-object value is stored in an object with a key matching the original key", () => {
        // #region Arguments
        test("Fails if `target` is not type `object` or is null", () => {
            assert.throws(() => splitKeysIntoArray(0))
            assert.throws(() => splitKeysIntoArray(null))
        })
        // #endregion


        // #region Results
        describe("Given all arguments are valid", () => {
            // #region Basic Splits
            describe("Basic Splits", () => {
                test("Separates key-value pairs into entries of an array", () => {
                    const target = {
                        a: "A",
                        b: "B",
                        c: "C"
                    }
                    const result = splitKeysIntoArray(target)
                    expect(result).toEqual([
                        { a: "A" },
                        { b: "B" },
                        { c: "C" }
                    ])
                })
            })
            // #endregion


            // #region Nested Objects
            describe("Nested Objects", () => {
                test("Keys in `target` that values are type `object` and are not null, can have their nested keys split", () => {
                    const target = {
                        a: "A",
                        b: { bee: "B" },
                        c: { 
                            see: "C",
                            sea: "C"
                        }
                    }
                    const result = splitKeysIntoArray(target)
                    expect(result).toEqual([
                        { a: "A" },
                        { b: { bee: "B" } },
                        { c: { see: "C" } },
                        { c: { sea: "C" } }
                    ])
                })
            })
            // #endregion
        })
        // #endregion
    })
})
// #endregion


// #region getDotNotation()
describe("getDotNotation()", () => {
    describe("Convert an object into a dot notation string", () => {
        // #region Arguments
        test("Fails if `target` is not type `object` or is null", () => {
            assert.throws(() => getDotNotation(0))
            assert.throws(() => getDotNotation(null))
        })
        // #endregion


        // #region Results
        describe("Given all arguments are valid", () => {
            // #region Basic Conversions
            describe("Basic Conversions", () => {
                test("Converts key into a dot notation string", () => {
                    const target = {
                        a: "A",
                    }
                    expect(getDotNotation(target)).toEqual("a")
                })

                test("Converts nested keys into a dot notation string", () => {
                    const target = {
                        a: {
                            b: "B"
                        }
                    }
                    expect(getDotNotation(target)).toEqual("a.b")
                })
            })
            // #endregion


            // #region Other Cases
            describe("Other Cases", () => {
                test("If object has multiple paths, first key is chosen", () => {
                    const target = {
                        a: {
                            A: "A",
                            B: "B",
                            C: "C"
                        }
                    }
                    expect(getDotNotation(target)).toEqual("a.A")
                })
            })
            // #endregion
        })
        // #endregion
    })
})
// #endregion