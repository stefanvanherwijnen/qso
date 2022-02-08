#!/usr/bin/env node

console.log()
// console.log(
//   require('fs').readFileSync(
//     require('path').join(__dirname, '../assets/logo.art'),
//     'utf8'
//   )
// )
// console.log('  Running @quasar/cli v' + require('../package.json').version)

import chalk from 'chalk'

console.log(`
  Example usage
    $ qso <command> <options>
  => IMPORTANT !
  => ${chalk.italic('Trigger this inside of a Quasar project (and npm/yarn install), or define the app root with --appDir.')}
  --------------
`)