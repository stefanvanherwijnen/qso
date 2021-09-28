import { log, warn, fatal } from '@stefanvh/quasar-app-vite/lib/helpers/logger'
import crossSpawn from 'cross-spawn'

/*
 Returns pid, takes onClose
 */
const spawn = function (cmd: string, params: string[], opts: Record<string, any>, onClose: (code: string) => void) {
  if (!cmd) {
    fatal(`Command name was not available. Please run again.`)
  }

  log(`Running "${cmd} ${params.join(' ')}"`)
  log()

  const runner = crossSpawn(
    cmd,
    params,
    // { stdio: 'inherit', stdout: 'inherit', stderr: 'inherit', ...opts }
    { stdio: 'inherit', ...opts }
  )

  runner.on('close', (code: string) => {
    log()
    if (code) {
      log(`Command "${cmd}" failed with exit code: ${code}`)
    }

    onClose && onClose(code)
  })

  if (opts.detach === true) {
    runner.unref()
  }

  return runner.pid
}

/*
 Returns nothing, takes onFail
 */
const spawnSync = function (cmd: string, params: string[], opts: Record<string, any>, onFail: () => void) {
  log(`[sync] Running "${cmd} ${params.join(' ')}"`)
  log()

  const runner = crossSpawn.sync(
    cmd,
    params,
    // { stdio: 'inherit', stdout: 'inherit', stderr: 'inherit', ...opts }
    { stdio: 'inherit', ...opts }
  )

  if (runner.status || runner.error) {
    warn()
    warn(`Command "${cmd}" failed with exit code: ${runner.status}`)
    if (runner.status === null) {
      warn(`Please globally install "${cmd}"`)
    }
    onFail && onFail()
    process.exit(1)
  }
}

export {
  spawn,
  spawnSync
}