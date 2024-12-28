// #region Imports

/*
	Import to load environment variables
	The values are not needed in this file, but the env vars must be loaded so 
	they are available to the server.
*/
import "~web-server/env.ts"

// #endregion Imports



// Create a command to start the server
const command = new Deno.Command(Deno.execPath(), { args: [
	"run",
	"-E",
	"-R",
	"-N",
	"--unstable-node-globals",
	"./web/build/index.js"
]})

// Start the server
command.spawn()