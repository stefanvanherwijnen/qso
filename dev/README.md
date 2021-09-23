# Quasar Development
This is a fork of https://github.com/quasarframework/quasar/tree/dev/ui/dev

A few modifications were required:
- Change `require.context` to glob import
- Modify all dynamic imports to adhere to the [dynamic import rules](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars)
- Remove `require` and webpack configuration from quasar.conf
- Replace `process.env` with `import.meta.env`
- Add an index file to the boot folder to glob import all boot files

## Testing
This provides the easiest way to test all Quasar functionalities. If you find any problems, please open an issue or even better submit a PR.