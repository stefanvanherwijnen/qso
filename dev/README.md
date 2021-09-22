## Quasar Development
This is a fork of https://github.com/quasarframework/quasar/tree/dev/ui/dev

A few modifications were required:
- Add `pages` alias.
- Change `require.context` to glob import
- Remove `require` and webpack configuration from quasar.conf
- Replace `process.env` with `import.meta.env`