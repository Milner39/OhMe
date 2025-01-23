// Set file name of Deno types declaration file
const fName = "deno.d.ts"


// Create a command to generate the Deno types
const command = new Deno.Command(Deno.execPath(), { args: [
	"types"
]})

// Generate the Deno types
const { stdout: typesRaw } = command.outputSync()

// Convert the data to a string
const typesString = new TextDecoder().decode(typesRaw)


// Replace references to other Deno libraries
const updatedTypesString = typesString.replace(
	'/// <reference lib="deno.net" />',
	""
)

// Write the updated types file
await Deno.writeFile(fName, new TextEncoder().encode(updatedTypesString))