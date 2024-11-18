Special consideration have to be taken into account when using Deno for a SvelteKit project.

- Firstly, the SvelteKit plugin for Vite only looks for Svelte config files at `./svelte.config.js`.
  Not `.ts`, not `.mjs`, only `.js` so using type script for the config file is out of the question.
  Luckily JSDocs can be used for non-strict type-checking.
    
- Secondly, the [Svelte for VS Code extension] is terrible for Deno.
  When opening a `.svelte` file, the extension will show this error:
  ```Error in svelte.config.js    SyntaxError: Cannot use import statement outside a module```
  This is annoying since the web app still works regardless but can be fixed with a `package.json` 
  file with this contents in the same directory:
  ```
  {
    "type": "module"
  }
  ```
  The next issue is much more frustrating, since the extension language server uses Node, it only
  supports Node dependencies, which means in order to not get a error like this:
  ```Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@std/path' imported from ...\svelte.config.js```
  You can't use any Deno dependencies in the `svelte.config.js` file.
