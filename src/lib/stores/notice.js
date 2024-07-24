// https://svelte.dev/docs/svelte-store#writable
// "...function that creates a store which has values that can be set from 'outside' components."
// Import function to create a store
import { writable } from "svelte/store"

// Define function to create a custom store
const createNoticeStore = (initialValue) => {
    const { subscribe, set, update } = writable(initialValue)

    const close = () => {
        set(null)
    }

    return { subscribe, set, update, close}
}

// Create store with `null` initial value
export const notice = createNoticeStore(null)