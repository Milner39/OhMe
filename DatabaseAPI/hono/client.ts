// #region Imports

// Import to get environment variables
import env from "../env.ts"

// Create configured Hono app
import { createApp } from "./lib/createApp.ts"

// Create Hono client
import { hc } from "hono/client"

// #endregion Imports



// Create a mock app
const mockApp = createApp()


/*
	Create a mock client to speed up the TypeScript language server

	Trick from the Hono docs: 
	https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended
*/
const mockClient = hc<typeof mockApp>("")


// Subroutine to create a client for this API
export const createApiClient = (): typeof mockClient => {
	return hc<typeof mockApp>(`http://localhost:${env.DATABASE_API_PORT}`)
}