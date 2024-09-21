// #region Imports

/*
    https://svelte.dev/docs/svelte-store#writable
    Subroutine to create stores
*/
import { writable } from "svelte/store"
// #endregion



// Define subroutine to create a custom store
const createNoticeStore = (initialValue) => {
    const { subscribe, set, update } = writable(initialValue)

    const close = () => {
        set(null)
    }

    return { subscribe, set, update, close}
}

// Create store with initial value of `null` 
const notice = createNoticeStore(null)



// #region Exports

// Default export
export { notice }

// #region 