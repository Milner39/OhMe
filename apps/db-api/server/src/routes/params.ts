// #region Imports

import { z } from "zod"

// #endregion Imports



/*
	Create a schema for the params of this route.
	Child routes can extend this schema so that the available params in each 
	route are type-safe and correct.
*/
const paramSchema = z.object({})

// Export param schema
export default paramSchema