/*
    Svelte plugin for vite does not let you define where 
    the config file is located.

    This file is a workaround.
    https://github.com/sveltejs/kit/issues/2973
*/

import config from "./svelte.config.mts"
export default config