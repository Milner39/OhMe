// #region Imports

import { createRouter } from "../../lib/createRouter.ts"

// #endregion Imports



// Create router
const router = createRouter().basePath("/user")

// Define methods for this path
router.post("/", (c) => {
    return c.json({
        Message: "Database API recieved request to create user"
    })
})


// Export router
export default router