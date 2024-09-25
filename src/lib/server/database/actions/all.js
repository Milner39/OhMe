// Import all database actions
import userActions from "./user"
import sessionActions from "./session"


// export all database actions as a single object
export default {
    user: userActions,
    session: sessionActions
}