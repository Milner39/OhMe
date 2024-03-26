import { redirect } from '@sveltejs/kit'

const loginPage = "/login"

export const load = async (event) => {
    if (event.url.pathname === loginPage) { return }

    // if (!event.locals.session) {
    //     redirect(302, loginPage)
    // }
}