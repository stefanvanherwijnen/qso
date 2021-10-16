# Quasar App Vite

This package aims to be a [Vite](https://vitejs.dev) based alternative for [@quasar/app](https://github.com/quasarframework/quasar/tree/dev/app).

## Install
```
pnpm add -D @stefanvh/quasar-app-vite
```

## Structure
This project is set up as a monorepo:
- `packages/quasar-app-vite`: The main package
- `packages/dev`: A port of the Quasar UI dev project
- `packages/example`: A minimal working example

Run `pnpm i` in the root folder and `pnpm exec quasar-app-vite [command]` in either the dev or example folder.

## Usage
### Commands
Use `pnpm exec` to run the following commands:

- `quasar-vite build`: Build your Quasar project and output to `dist/`
- `quasar-vite dev`: Spin up a development server

## Features
- Pure ESM package
- Typescript
- Auto-import of components and SASS (no need to import non tree shakeable CSS)
- Support for SPA and SSR builds with PWA as option for both

## Development project
A modified [Quasar UI dev project](https://github.com/quasarframework/quasar/tree/dev/ui/dev) can be found under [dev](./dev). There is a lot to be tested, so any extra help would be appreciated :smile:.

## Known issues
- [SSR mode](https://vitejs.dev/guide/ssr.html) is still experimental and has some problems
  - SSR builds use `require()` at runtime, which makes it impossible to import ESM files from node_modules. For this reason `noExternal: [ 'quasar']` has to be used which means that all source code will be compiled to CJS which leads to longer build times
  - The dev server does not support injecting CSS (https://github.com/vitejs/vite/issues/2282).
- This package is an ES Module. Support for ESM in Node is partly experimental which means that any number of errors may occur (although everything seems to work at the moment)
- Files should use ESM supported syntax. E.g. when exporting multiple values and a default value from a module, you will need to explicitly import the default export (e.g. `import { default as VuePlugin }`). 
- Quasar is packed with features and there is still a long way to go to port everything to Vite.

## Considerations
- Instead of template interpolation for build time imports, [virtual files](https://vitejs.dev/guide/api-plugin.html#importing-a-virtual-file) are used to import the required plugins, components, extras and boot files at runtime.
- Because quasar/ui uses CommonJS code at the moment, some 'hacks' are required to make e.g. `quasar/wrappers` work.
- ~~Auto import of components and SASS with unplugin-vue-components only works from Vue SFC source files. Nested components in for example an app extension are not automatically resolved, thus there needs to be a way to let Vite know what to import (instead of importing everything). Right now quasar.conf is used for this purpose and app extensions should extend it with the components used in the app extension.~~<br />
While Vue components written in plain javascript will not work, this problem can be solved for SFC's by aliasing the `src` of a package (thus compiling from source directly).
- Any Babel or Webpack features used by Vue or Quasar obviously will not work (e.g. `transpileDependencies` or `extendWebpack`). There should be a review on which of these can be dropped and how any required features can be ported.