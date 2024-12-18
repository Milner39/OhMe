// #region Imports

import { createRouter } from "../../../../lib/createRouter.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user/:userId/session")

// Define methods for this path
router.get("/", (c) => {
    // Correct type
    const { userId } = c.req.param()

    return c.json({
        message: "Hello user!"
    })
})



// Export router
export default router