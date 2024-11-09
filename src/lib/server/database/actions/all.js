// Import all database actions
import userActions from "./user"
import sessionActions from "./session"
import friendRequestActions from "./friendRequest"


// export all database actions as a single object
export default {
    user: userActions,
    session: sessionActions,
    friendRequest: friendRequestActions
}