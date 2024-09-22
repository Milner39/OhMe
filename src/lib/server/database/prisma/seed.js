// #region Imports
import dbClient from "./prisma.js"
import inputHandler from "../../utils/inputHandler.js"
/*
    ISSUE: "$lib" alias does not work.

    FIX: 
        Create a script to run this file with vite,
        since vite resolves the aliases.
*/
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