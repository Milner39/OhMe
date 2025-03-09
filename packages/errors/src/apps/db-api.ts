// #region Imports

import { NotNull } from "@/packages/utils/src/type-utils"
import { KnownError, createKnownErrorClass } from ".."

// #endregion Imports



export const DBAPIError = createKnownErrorClass(
	KnownError, ["db-api"],
	"Error occurred in Database API",
	null
)

export const DBORMError = createKnownErrorClass(
	DBAPIError, ["db-api", "db-orm"],
	"Error occurred in Database ORM",
	null
)

export const DBORMQueryError = createKnownErrorClass(
	DBAPIError, ["db-api", "db-orm", "query"],
	"Error occurred when Database ORM executed a query",
	null
)

export const DBORMQueryBadExecutionError = createKnownErrorClass(
	DBAPIError, ["db-api", "db-orm", "query"],
	"Error occurred in the execution of a Database ORM query",
	null
)



const a = new DBORMQueryBadExecutionError()