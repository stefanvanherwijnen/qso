#!/usr/bin/env node

// require('../lib/node-version-check')
// require('../lib/helpers/cli-error-handling')
export {}

const commands = [
  // 'dev',
  'build',
  // 'clean',
  // 'inspect',
  // 'describe',
  // 'ext',
  // 'run',
  // 'mode',
  // 'info',
  // 'new',
  // 'test',
  // 'help'
]

let cmd = process.argv[2]

if (cmd) {
  if (cmd.length === 1) {
    const mapToCmd: Record<string, string> = {
      d: 'dev',
      b: 'build',
      e: 'ext',
      r: 'run',
      c: 'clean',
      m: 'mode',
      i: 'info',
      n: 'new',
      t: 'test',
      h: 'help'
    }
    cmd = mapToCmd[cmd]
  }

  if (commands.includes(cmd)) {
    process.argv.splice(2, 1)
  }
  else {
    if (cmd === '-v' || cmd === '--version') {
      console.log(require('../package.json').version)
      process.exit(0)
    }

    const { log, warn } = await import('@qso/app/helpers/logger')

    if (cmd === '-h' || cmd === '--help') {
      cmd = 'help'
    }
    else if (cmd.indexOf('-') === 0) {
      warn(`Command must come before the options`)
      cmd = 'help'
    }
    // else {
    //   log(`Looking for Quasar App Extension "${process.argv[2]}" command${(process.argv[3] && (' "' + process.argv[3] + '"')) || ''}`)

    //   const exit = process.exit
    //   // @ts-ignore
    //   process.exit = (code?: number, reason?: string) => {
    //     if (reason === 'ext-missing') {
    //       // require('./quasar-help')
    //       exit(0)
    //     }
    //     else {
    //       exit(code)
    //     }
    //   }

    //   cmd = 'run'
    // }
  }
}
else {
  cmd = 'help'
}

await import(`@qso/app/${cmd}`)
