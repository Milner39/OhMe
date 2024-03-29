// Import function to create lucia client, and util functions
import { Lucia, TimeSpan } from "lucia"

// Import prisma adapter to allow lucia to manipulate database
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";

// Import the prisma client
import { client as prismaClient } from "$lib/server/prisma"

// Create lucia client and pass in session and user models
const client = new Lucia(new PrismaAdapter(prismaClient.Session, prismaClient.User), {
	// Configure which feilds from the database should be returned when getting user and session data from lucia
	getUserAttributes: (attributes) => {
		return {
			id: attributes.id,
			username: attributes.username,
			email: attributes.email
		}
	},
	getSessionAttributes: (attributes) => {
		return {
			id: attributes.id,
			expiresAt: attributes.expiresAt,
			userId: attributes.userId
		}
	},

	// The time it takes for a session to expire
	sessionExpiresIn: new TimeSpan(3, "w"),

	// Session cookie options
	sessionCookie: {
		name: "session",

		// Expires true removes alot of customization from the session expirey and extending functionality
		// For most projects it is usefull, but it wont be used here
		expires: false,

		attributes: {
			// Session cookie cannot be shared between sites
			sameSite: "strict"
		}
	}
})

export { client }