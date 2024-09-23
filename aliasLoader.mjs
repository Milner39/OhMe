/*
	https://nodejs.org/api/esm.html#esm_loaders
	Create custom ESM loader to resolve path aliases in `package.json`.

	This should be used when a script is run with node but imports files
	using path aliases.


	How to use:
	`node --no-warnings --loader {path_to_this_file} {path_to_target_script}`

	`--no-warnings` is optional.
*/

// #region Imports
import path from "path"
import npmPackage from "./package.json" with { type: "json" }
// #endregion



// #region getAbsoluteAliases()
/*
	Subroutine to get the absolute path of the file / directory
	that the aliases in `package.json` point to.

		- Get the current working directory.

		- Get the string to prefix paths based on the platform
		  this process is is running on.
		
		- Get all the aliases defined in `package.json`.

		- Get the absolute path for each alias

		- Return an object with each alias and absolute path 
		  as key-value pairs.
*/
const getAbsoluteAliases = () => {
	const base = process.cwd()
	const platformPrefix = process.platform === "win32" ? "file://" : ""

	const aliases = npmPackage.aliases || {}

	const absoluteAliases = Object.entries(aliases).reduce((aliasesObject, [alias, path_]) => {
		return {
			...aliasesObject, 
			[alias]: 
				// If alias is set to an absolute path
				path_ === '/' ? 
					path_ : 
					path.join(platformPrefix, base, path_)
		}
	}, {})

	return absoluteAliases
}
// #endregion



// #region pathStartsWithAlias()
/*
	Subroutine to check if a path starts with an alias.
*/
const pathStartsWithAlias = (path, alias) => {
  	return (
		path.indexOf(alias) === 0 && 

		// Make sure "$alias" doesn't match "$alias2"
		(
			// "$alias" or "$alias/..."
			path.length === alias.length || 
			path[alias.length] === '/'
		)
	)
}
// #endregion



// #region Export ESM Loader
/*
	- Get the absolute aliases.

	- Get the alias that a path starts with
*/

// Absolute aliases
const aliases = getAbsoluteAliases()

// Runs on every file import
export const resolve = (specifier, parentModuleURL, defaultResolve) => {
  
  	const alias = Object.keys(aliases).find((key) => { return pathStartsWithAlias(specifier, key) })

  	const newSpecifier = alias === undefined ? 
		// If path starts with no alias, use original path
		specifier : 

		/* 
			Otherwise join the absolute path for the matching 
			alias with the rest of the path.
		*/
		path.join(aliases[alias], specifier.substr(alias.length))


  	return defaultResolve(newSpecifier, parentModuleURL)
}
// #endregion