// #region Imports
/*
   https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/instantiate-prisma-client
   Provides subroutines for making database queries
*/
import { PrismaClient } from "@prisma/client"
// #endregion



// Define a database client
const client = new PrismaClient()



// #region Exports

// Default export
export default client

// #endregion