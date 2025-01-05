// #region Imports

import { createApiClient as c } from "./lib/create-client.ts"
import type { Client } from "../dist/packages/db-api-client/src/lib/create-client.d.ts"

// #endregion Imports



// Create wrapper function with compiled types
export const createApiClient = (): Client => c()