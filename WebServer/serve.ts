// #region Imports

// Import to load environment variables
// - The values are not needed, but the environment variables must be loaded
import "./env.ts"

// #endregion Imports



// Create a command to start the server
const command = new Deno.Command(Deno.execPath(), { args: [
	"run",
	"-E",
	"-R",
	"-N",
	"--unstable-node-globals",
	"./build/index.js"
]})

// Start the server
command.spawn()