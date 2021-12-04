import { renderTemplate } from './index.js'
import parseArgs from 'minimist'
import { pathToFileURL } from 'url'
const argv = parseArgs(process.argv.slice(2), {
  string: ['template'],
})

if (!argv.template) {
  throw new Error('Please provide a template argument: --template')
}

const cwdUrl = pathToFileURL(`${process.cwd()}/`)

renderTemplate({
  template: argv.template,
  outputDir: new URL(`./${argv._[0] || argv.template}/`, cwdUrl)
})