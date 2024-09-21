/*
    This is only here for the `privateGuard()` handle in src/hooks.server.js.
    It forces handles to be re ran. Otherwise clients can go to all routes 
    as they will be unguarded.
    I am not sure why having this empty file here works but ¯\_(ツ)_/¯
    As of now, I do not know if there is an alternative fix but I will 
    read the docs again.
*/