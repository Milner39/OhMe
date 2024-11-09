// #region Imports
import dbClient from "$lib/server/database/prisma/dbClient.js"
import inputHandler from "$lib/server/utils/inputHandler.js"
// #endregion



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
        await dbClient.user.create({
            // Set data fields
            data: {
                username,
                email: {
                    create: {
                        address: inputHandler.sanitize(`${username}@example.com`)
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