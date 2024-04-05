// Import functions to manage context
import { getContext, setContext } from "svelte"
// Import function to create a store
import { writable } from "svelte/store"

const NOTICE_CTX = "NOTICE_CTX"

// Function to create the notice store
// and attach it to the component tree
const setNoticeState = (value) => {
    const noticeState = writable(value)
    setContext(NOTICE_CTX, noticeState)
    return noticeState
}

// Function to subscribe to the notice store
const getNoticeState = () => {
    return getContext(NOTICE_CTX)
}

export {
    setNoticeState,
    getNoticeState
}