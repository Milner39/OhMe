import { Lucia, TimeSpan } from "lucia"
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { client as prismaClient } from "$lib/server/prisma"

const client = new Lucia(new PrismaAdapter(prismaClient.session, prismaClient.user), {
	getSessionAttributes: (attributes) => {
		return {
			
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		}
	},
	sessionExpiresIn: new TimeSpan(3, "w"),
	sessionCookie: {
		name: "session",
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	}
})

export { client }