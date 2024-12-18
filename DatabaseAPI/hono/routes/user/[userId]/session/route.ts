// #region Imports

import { createRouter } from "../../../../lib/createRouter.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/session")

// Define methods for this path
router.get("/", (c) => {
    // Incorrect type
    const { userId } = c.req.param()

    return c.json({
        message: "Hello user!"
    })
})



// Export router
export default router