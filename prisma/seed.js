// Import prisma client instance to modify db
import { client as prismaClient } from "../src/lib/server/prisma.js"

// Define test data
const usernames = [
    "Molly", 
    "Henry", 
    "Jess",
    "Joe",
    "Nell",
    "Ryan",
    "Youssef",
    "Zoe",
    "Shae", 
    "Bailey", 
    "Jonathan",
    "Leen",
    "Rupert",
    "Tarika",
    "Toni"
]

// Loop over test data creating users
for (const username of usernames) {
    try {
        await prismaClient.User.create({
            // Set data fields
            data: {
                username,
                email: {
                    create: {
                        address: `${username}@example.com`
                    }
                },
                password: {
                    create: {
                        // Make sure test users cannot be logged into
                        hash: "Test User"
                    }
                }
            }
        })
    } catch (err) {
        // Continue to next username if username taken
        if (err.code === "P2002") {
            continue
        }
    }
}

// Run with `npx prisma db seed`