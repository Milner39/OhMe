// #region Imports

// Import types
import type { LayoutServerLoad } from "./$types"

// #endregion



// Return any required data in locals to the front end
export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        userData: locals.userData
    }
}