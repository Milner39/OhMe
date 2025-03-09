/** ErrorTree
 * 
 * Holds every valid error code path.
 * 
 * A value of `null` marks a leaf node.
 */
export type ErrorTree = {
	"db-api": {
		"db-orm": {
			"query": {
				BadExecution: null
				BadArguments: null,
				BadResult: {
					ReadOneFoundNone: null;
					ReadOneFoundMany: null;
				}
			}
		}
		server: {
			auth: {
				login: {
					NoUserFound: null;
				}
				register: {
					MatchingCredsExist: null;
				}
			}
		}
	}
	"web-server": null
}


/** NestedErrorPaths
 * 
 * Recursively generates all valid error code paths.
 * 
 * Takes an optional Prefix (accumulated keys) and appends each key.
 */
export type NestedErrorPaths<T, Prefix extends string[] = []> = {
	[K in keyof T]: T[K] extends null
		? [...Prefix, K & string]
		: [...Prefix, K & string] | NestedErrorPaths<T[K], [...Prefix, K & string]>
}[keyof T];


/** ErrorCode
 * 
 * Matches any of the valid error code paths.
 */
export type ErrorCode = NestedErrorPaths<ErrorTree>