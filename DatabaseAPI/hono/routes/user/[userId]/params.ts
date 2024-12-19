// #region Imports

// Import parent param schema
import paramSchema from "../../params.ts"

// Validation
import { z } from "zod"

// #endregion Imports



// Create a schema for the params of this route
const extendedParamSchema = paramSchema.extend({
    userId: z.string().uuid()
})

// Export param schema
export default extendedParamSchema