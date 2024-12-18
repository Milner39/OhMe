// #region Imports

import { createRouter } from "../../lib/createRouter.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user")

// Mount child routers onto router
// Example: router.route("/", email)

// Define methods for this path
router.post("/", (c) => {
    return c.json({
        message: "Hello user!"
    })
})



// Export router
export default router