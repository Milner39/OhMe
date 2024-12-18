// #region Imports

import { createRouter } from "../lib/createRouter.ts"

// Import child routes
import user from "./user/route.ts"

// #endregion Imports



// Create base router
const router = createRouter().basePath("/")

// Mount child routers onto base router
router.route("/", user)

// Base path has no methods



// Export base router
export default router