// #region Imports

/*
	Import to get environment variables.
	Only get shared environment variables or this client will not work and could 
	be unsafe.
*/
import env from "@/env"

import { hc } from "hono/client"
import { App } from "~db-api/server/src/lib/create-app"

// #endregion Imports



/*
	Create a mock client to speed up the TypeScript language server

	Trick from the Hono docs: 
	https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended
*/
const mockClient = hc<App>("")
export type Client = typeof mockClient


// Subroutine to create a client for this API
export const createApiClient = (): Client => {
	return hc<App>(`http://localhost:${env.DATABASE_API_PORT}`)
}