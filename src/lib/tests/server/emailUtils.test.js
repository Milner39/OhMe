// #region Imports
import { describe, test, expect, onTestFinished } from "vitest"
import { createTransport, createEmailer } from "$lib/server/utils/emailUtils.js"
import path from "path"
import jsonUtils from "$lib/server/utils/jsonUtils.js"
// #endregion



// #region Test Data
// Get test data object from JSON file
const testDataPath = path.resolve(process.cwd(), "src/lib/tests/testData.json")
const testData = jsonUtils.read_createIfNotExists(testDataPath).emailUtils || {}

const updateTestDataKey_clearIfFail = (state, key) => {
    /*
        If the test fails, set the `emailUtils[key]` key to null, this will
        avoid the test always failing as some logic would never run if 
        `emailUtils[key]` was always truthy.
    */
    if (state === "fail") { testData[key] = null }

    /* 
        Save the test data object to the test data file. This lets objects 
        be reused on subsequent test runs, improving performance as the logic
        to create those objects won't have to rerun.
    */
    jsonUtils.update_createIfNotExists(testDataPath, { emailUtils: testData })
}



// Get transport credentials
const transportAuth = testData.transport?.auth

// Create transport
const transport = await createTransport(
    transportAuth,
    {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
    }
)
// #endregion



// #region Transport
describe("createTransport()", async () => {
    test("Returns a `Transport` object", () => {
        onTestFinished(({ state }) => { updateTestDataKey_clearIfFail(state, "transport") })

        expect(transport).toBeTruthy()

        // Update the test data if the test passes
        testData.transport = testData.transport || {}
        testData.transport.auth = transport.options.auth
    })

    test.skip("sendMail()", async () => {
        onTestFinished(({ state }) => { updateTestDataKey_clearIfFail(state, "transport") })
        
        const result = await transport.sendMail({
            from: {
                name: transport.name,
                address: transport.address
            },
            to: transport.address,
            subject: "Test Email",
            text: "This is a test email."
        })

        expect(result).not.toBeNull()
        expect(result.accepted).toEqual([transport.address])
    })
})
// #endregion

// #region Emailer
describe.runIf(transport)("createEmailer()", async () => {
    // Create emailer
    const emailer = await createEmailer(transport)

    test("Returns an `Emailer` object", () => {
        expect(emailer).toBeTruthy()
    })

    test.skip("send()", async () => {
        const result = await emailer.send(null, {
            subject: "Test Email",
            text: "This is a test email."
        })

        expect(result.accepted).toEqual([transport.address])
    })
})
// #endregion