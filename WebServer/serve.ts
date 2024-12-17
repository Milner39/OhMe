// #region Imports

// Import to get environment variables
import { loadAllDotenvs } from "./allDotenvs.ts"

// #endregion Imports



// Load environment variables
loadAllDotenvs()



// Create a command to start the server
const command = new Deno.Command(Deno.execPath(), { args: [
	"run",
	"-E",
	"-R",
	"-N",
	"./build/index.js"
]})

// Start the server
command.spawn()