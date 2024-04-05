// Import function to create a store
import { writable } from "svelte/store"

const createNoticeStore = (initalValue) => {
    const { subscribe, set, update } = writable(initalValue)

    const close = () => {
        set(null)
    }

    return { subscribe, set, update, close}
}

export const notice = createNoticeStore(null)