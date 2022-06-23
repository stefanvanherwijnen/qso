# This project has moved on to [Vitrify](https://github.com/simsustech/vitrify).

# Vite build tool for Quasar Framework

Unofficial Vite build tool for Quasar Framework. Build and development server support for client-side- and server side rendering.

# Try it out
```bash
pnpm create @qso/create-quasar my-quasar-vite-app
cd my-quasar-vite-app
pnpm i
pnpm run dev
```
Or use the package manager of your choice (yarn/npm).

## Commands

Use `pnpm exec` to run the following commands:

- `qso build`: Build your Quasar project
  - `-m`: Build mode: `csr`, `ssr` or `ssg`
  - `--base`: For SSR: https://vitejs.dev/guide/build.html#public-base-path
  - `--outDir`: Output directory, defaults to `./dist`
- `qso dev`: Spin up a development server
  - `-m`: Build mode: `csr` or `ssr`
  - `--host`: https://vitejs.dev/config/#server-host

Or install `@qso/app` globally.

## Features

- In essence @qso/app functions as a preset for Vite
  - When using @qso/app all Quasar UI features should work out of the box.
  - Any Quasar specific configurations are set with the `quasar` object in the Vite config.

- Build modes for client-side rendering, server side rendering and static site generation.
- The new [quasar.config.js](packages/app/src/quasar-vite-config.ts) file is the vite.config.js file in your Quasar project. It will be merged with the defaults upon compilation.

## Development project

A modified [Quasar UI dev project](https://github.com/quasarframework/quasar/tree/dev/ui/dev) can be found under [dev](./dev).

## Known issues

- [SSR mode](https://vitejs.dev/guide/ssr.html) is still experimental and has some problems
  - SSR builds use `require()` at runtime, which makes it impossible to import ESM files from node_modules. For this reason `noExternal: [ 'quasar']` has to be used which means that all source code will be compiled to CJS which leads to longer build times
  - The dev server does not support injecting CSS (https://github.com/vitejs/vite/issues/2282).
- This package is an ES Module. Support for ESM in Node is partly experimental which means that any number of errors may occur (although everything seems to work at the moment)
- Files should use ESM supported syntax. E.g. when exporting multiple values and a default value from a module, you will need to explicitly import the default export (e.g. `import { default as VuePlugin }`).
- Importing and tree-shaking SASS/CSS is problemtatic. unplugin-auto-import injects CSS for all components found in the templates of Vue files, but for JS imports this does not work. E.g. `import { QBtn } from 'quasar'` will not automatically injects the required CSS. You either have to use
  `import 'quasar/src/css/index.sass'` in your main.js file or `import 'quasar/src/components/btn/QBtn.sass' in your Vue or JS file.
  For now, the all of the Quasar CSS is imported.
- Quasar is packed with features and there is still a long way to go to port everything to Vite.
