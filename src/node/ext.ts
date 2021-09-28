#!/usr/bin/env node

import parseArgs from 'minimist'

const argv = parseArgs(process.argv.slice(3), {
  alias: {
    h: 'help'
  },
  boolean: ['h']
})

function showHelp () {
  console.log(`
  Description
    Manage Quasar App Extensions
  Usage
    # display list of installed extensions
    $ quasar ext
    # Add Quasar App Extension
    $ quasar ext add <ext-id>
    # Remove Quasar App Extension
    $ quasar ext remove <ext-id>
    # Add Quasar App Extension, but
    # skip installing the npm package
    # (assumes it's already installed)
    $ quasar ext invoke <ext-id>
    # Remove Quasar App Extension, but
    # skip uninstalling the npm package
    $ quasar ext uninvoke <ext-id>
  Options
    --help, -h       Displays this message
  `)
}

if (argv.help) {
  showHelp()
  process.exit(0)
}

import { warn } from '@stefanvh/quasar-app-vite/lib/helpers/logger'

if (argv._.length !== 0 && argv._.length !== 2) {
  console.log()
  warn(`Wrong number of parameters (${argv._.length}).`)
  showHelp()
  process.exit(1)
}

async function run (action: string, name: string) {
  const Extension = (await import('@stefanvh/quasar-app-vite/lib/app-extension/Extenson')).default
  const extension = new Extension(name)

  await extension[
    action === 'add' || action === 'invoke'
      ? 'install'
      : 'uninstall'
    ](action === 'invoke' || action === 'uninvoke')
}

if (argv._.length === 0) {
  const extensionJson = (await import('@stefanvh/quasar-app-vite/lib/app-extension/extension-json')).default
  extensionJson.list()
}
else {
  const [ action, name ] = argv._

  if (!['add', 'remove', 'invoke', 'uninvoke'].includes(action)) {
    console.log()
    warn(`Unknown action specified (${action}).`)
    showHelp()
    process.exit(1)
  }

  run(action, name)
}