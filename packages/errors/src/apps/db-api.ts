// #region Imports

import { NotNull } from "@/packages/utils/src/type-utils"
import { KnownError, createKnownErrorClass } from ".."

// #endregion Imports



export const DBAPIError = createKnownErrorClass(
	KnownError,
	["db-api"],
	"Error occurred in Database API"
)

export const DBORMError = createKnownErrorClass(
	DBAPIError,
	["db-api", "db-orm"],
	"Error occurred in Database ORM"
)

export const DBORMQueryError = createKnownErrorClass(
	DBAPIError,
	["db-api", "db-orm", "query"],
	"Error occurred when Database ORM executed a query"
)

export const DBORMQueryBadExecutionError = createKnownErrorClass<
	typeof DBAPIError,
	["db-api", "db-orm", "query"],
	"Error occurred in the execution of a Database ORM query",
	{
		queryType: "create" | "read" | "update" | "delete",
		error: NotNull
	}
>(
	DBAPIError,
	["db-api", "db-orm", "query"],
	"Error occurred in the execution of a Database ORM query"
)


// ISSUE: Should throw error but doesn't
const a = new DBORMQueryBadExecutionError(null)
type A = Prettify<typeof a>

const b = new DBORMQueryBadExecutionError({
	queryType: "read",
	error: ""
})
type B = Prettify<typeof b>




type Prettify<T> = { [K in keyof T]: T[K] } & {}