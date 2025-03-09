// #region Imports

import { NotNull } from "@/packages/utils/src/type-utils"
import { KnownError, createKnownErrorClass } from ".."
import { QueryType } from "~db-api/db-orm/src/db-ops/generic"

// #endregion Imports



// #region Errors
// Indentation matches `ErrorTree`

export const DBAPIError = createKnownErrorClass(
	KnownError,
	["db-api"],
	"Error occurred in Database API"
)


	export const DBORMError = createKnownErrorClass(
		DBAPIError,
		["db-api","db-orm"],
		"Error occurred in Database ORM"
	)


		export const DBORMQueryError = createKnownErrorClass(
			DBORMError,
			["db-api","db-orm","query"],
			"Error occurred during the lifecycle of a query"
		)


			export const DBORMQueryBadExecutionError = createKnownErrorClass<
				// @ts-ignore
				{
					queryType: QueryType,
					error: NotNull
				}
			>(
				DBORMQueryError,
				["db-api", "db-orm", "query", "BadExecution"],
				"Error occurred during the execution of a query"
			)

			export const DBORMQueryBadResultError = createKnownErrorClass(
				DBORMQueryError,
				["db-api", "db-orm", "query", "BadResult"],
				"Query returned unexpected result"
			)


				export const QueryOneFoundNoneError = createKnownErrorClass(
					DBORMQueryBadResultError,
					["db-api", "db-orm", "query", "BadResult", "OneFoundNone"],
					"Read one query returned no rows"
				)

				export const QueryOneFoundManyError = createKnownErrorClass(
					DBORMQueryBadResultError,
					["db-api", "db-orm", "query", "BadResult", "OneFoundMany"],
					"Read one query returned multiple rows"
				)

// #endregion Errors