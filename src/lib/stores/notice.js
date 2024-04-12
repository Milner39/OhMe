// https://svelte.dev/docs/svelte-store#writable
// "...function that creates a store which has values that can be set from 'outside' components."
// Import function to create a store
import { writable } from "svelte/store"

// Define function to create a custom store
const createNoticeStore = (initalValue) => {
    const { subscribe, set, update } = writable(initalValue)

    const close = () => {
        set(null)
    }

    return { subscribe, set, update, close}
}

// Create store with `null` inital value
export const notice = createNoticeStore(null)