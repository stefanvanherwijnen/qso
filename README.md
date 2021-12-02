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
- `packages/example-typescript`: A minimal working example of a typescript project
- `packages/vite-project`: A standard Vite project modified to work with Quasar with just the QuasarPlugin

Run `pnpm i` in the root folder and `pnpm exec quasar-app-vite [command]` in any of the Quasar project folders.

## Usage

### Commands

Use `pnpm exec` to run the following commands:

- `quasar-vite build`: Build your Quasar project
  - `-m`: Build mode: `csr` or `ssr`
  - `--base`: For SSR: https://vitejs.dev/guide/build.html#public-base-path
  - `--outDir`: Output directory, defaults to `./dist`
- `quasar-vite dev`: Spin up a development server
  - `-m`: Build mode: `csr` or `ssr`
  - `--host`: https://vitejs.dev/config/#server-host

## Features

- Pure ESM package
- Typescript
- Auto-import of components and SASS (no need to import non tree shakeable CSS)
- Support for SPA and SSR builds with PWA as option for both
- SSR builds generate a working Vue SSR build and a Fastify server to serve the app

## quasar.conf.js

A lot of entries from quasar.conf.js are deprecated and some new ones are added:

```js
export default function (ctx) {
  return {
    // Unchanged
    boot: ["test.js", "qcalendar.js"],
    extras: ["material-icons"],
    framework: {
      components: ["QBtn"],
      plugins: ["Notify"],
    },
    css: ["~@quasar/quasar-ui-qcalendar/src/index.sass"],
    // New
    // The following is a Vite config object which is merged at build time
    vite: {
      plugins: [
        {
          name: "test-plugin",
          config: (config, env) => {
            console.log("Test plugin loaded");
            return config;
          },
        },
      ],
    },
    // For SSR builds the setup function runs directly after initializing the Fastify app.
    // Can be used for adding extra functionalities to your Quasar app (e.g. combined SSR app and API)
    fastify: {
      setup: (fastify) => console.log("test fastify"),
    },
  };
}
```

## Development project

A modified [Quasar UI dev project](https://github.com/quasarframework/quasar/tree/dev/ui/dev) can be found under [dev](./dev).

## Known issues

- [SSR mode](https://vitejs.dev/guide/ssr.html) is still experimental and has some problems
  - SSR builds use `require()` at runtime, which makes it impossible to import ESM files from node_modules. For this reason `noExternal: [ 'quasar']` has to be used which means that all source code will be compiled to CJS which leads to longer build times
  - The dev server does not support injecting CSS (https://github.com/vitejs/vite/issues/2282).
- This package is an ES Module. Support for ESM in Node is partly experimental which means that any number of errors may occur (although everything seems to work at the moment)
- Files should use ESM supported syntax. E.g. when exporting multiple values and a default value from a module, you will need to explicitly import the default export (e.g. `import { default as VuePlugin }`).
- Importing SASS/CSS is problemtatic. unplugin-auto-import injects CSS for all components found in the templates of Vue files, but for JS imports this does not work. E.g. `import { QBtn } from 'quasar'` will not automatically injects the required CSS. You either have to use
  `import 'quasar/src/css/index.sass'` in your main.js file or `import 'quasar/src/components/btn/QBtn.sass' in your Vue or JS file.
- Quasar is packed with features and there is still a long way to go to port everything to Vite.

## Considerations

- Instead of template interpolation for build time imports, [virtual files](https://vitejs.dev/guide/api-plugin.html#importing-a-virtual-file) are used to import the required plugins, components, extras and boot files at runtime.
- Because quasar/ui uses CommonJS code at the moment, some 'hacks' are required to make e.g. `quasar/wrappers` work.
- ~~Auto import of components and SASS with unplugin-vue-components only works from Vue SFC source files. Nested components in for example an app extension are not automatically resolved, thus there needs to be a way to let Vite know what to import (instead of importing everything). Right now quasar.conf is used for this purpose and app extensions should extend it with the components used in the app extension.~~<br />
- Any Babel or Webpack features used by Vue or Quasar obviously will not work (e.g. `transpileDependencies` or `extendWebpack`). There should be a review on which of these can be dropped and how any required features can be ported.
