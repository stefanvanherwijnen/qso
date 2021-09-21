# Quasar App Vite

This package aims to be a [Vite](https://vitejs.dev) based alternative for [@quasar/app](https://github.com/quasarframework/quasar/tree/dev/app).

## Install
```
yarn add --dev @stefanvh/quasar-app-vite
```
or
```
npm install --save-dev @stefanvh/quasar-app-vite
```

## Example
Clone the example folder for a minimal working example.

## Usage
### Commands
Use `yarn run` or `npx`:

- `quasar-vite build`: Build your Quasar project and output to `dist/`
- `quasar-vite dev`: Spin up a development server

### Quasar Vite plugin
You can also use the Vite plugin directly in your Vite config:
```js
import { QuasarPlugin } from '@stefanvh/quasar-app-vite'
``` 

## Features
- Pure ESM package
- Typescript
- Auto-import of components and SASS (no need to import non tree shakeable CSS)
- Support for SPA and SSR builds with PWA as option for both

## Known issues
- [SSR mode](https://vitejs.dev/guide/ssr.html) is still experimental and has some problems
  - SSR builds use `require()` at runtime, which makes it impossible to import ESM files from node_modules. For this reason `noExternal: [ 'quasar']` has to be used which means that all source code will be compiled to CJS which leads to longer build times
  - The dev server does not support injecting CSS (https://github.com/vitejs/vite/issues/2282).
- This package is an ES Module. Support for ESM in Node is partly experimental which means that any number of errors may occur (although everything seems to work at the moment)
- Quasar is packed with features and there is still a long way to go to port everything to Vite.