// Import prisma client instance to interact with db
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
    
    // Catch errors
    } catch (error) {
        // Continue to next username if username taken
        if (error.code === "P2002") {
            continue
        } else {
            throw error
        }
    }
}


// Run with `npx prisma db seed`