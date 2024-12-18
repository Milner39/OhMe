// #region Imports

import { createRouter } from "../../../lib/createRouter.ts"

// Import child routes
import session from "./session/route.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/:userId")

// Mount child routers onto router
router.route("/", session)

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