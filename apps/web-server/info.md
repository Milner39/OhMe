Special consideration has to be taken into account when using Deno for a
SvelteKit project.

- Firstly, the SvelteKit plugin for Vite only looks for Svelte config files at
  `./svelte.config.js`.
  Not `.ts`, not `.mjs`, only `.js` so using type script for the config file is
  out of the question. Luckily JSDocs can be used for non-strict type-checking.
  
- Secondly, the [Svelte for VS Code extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
  is terrible for Deno.
  When opening a `.svelte` file, the extension will show this error:
  ```
  Error in svelte.config.js    SyntaxError: Cannot use import statement outside a module
  ```
  This is annoying since the web app still works regardless but can be fixed
  with a `package.json` file with this contents:
  ```
  {
    "type": "module"
  }
  ```