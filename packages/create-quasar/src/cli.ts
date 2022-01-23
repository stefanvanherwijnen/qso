import { renderTemplate } from './index.js'
import parseArgs from 'minimist'
import { pathToFileURL } from 'url'
import inquirer, { QuestionCollection } from 'inquirer'
import { promises } from 'fs'
const escape = (val: any) => JSON.stringify(val).slice(1, -1)

const templates = (await promises.readdir(new URL('../templates/', import.meta.url), { withFileTypes: true }))
  .filter((file) => file.isDirectory())
  .map((file) => file.name)

const argv = parseArgs(process.argv.slice(2), {
  string: ['template'],
})

let answers: Record<string, any>
let questions: QuestionCollection[] = []
if (!argv.template) {
  // throw new Error('Please provide a template argument: --template')
  questions = [
    ...questions,
    {
      type: 'list',
      name: 'template',
      message: 'Which template would you like to use?',
      choices: templates
    }
  ]
}

questions = [
  ...questions,
  {
    type: 'input',
    name: 'name',
    message: 'Project name (internal usage for dev)',
    validate: (val: string) => val && val.length > 0,
    default: argv._[0]
  },
  {
    type: 'input',
    name: 'productName',
    message: 'Project product name (must start with letter if building mobile apps)',
    default: 'Quasar App',
    validate: (val: string) => val && val.length > 0,
    transformer: escape
  },
  {
    type: 'input',
    name: 'description',
    message: 'Project description',
    default: 'A Quasar Framework app',
    transformer: escape
  },
  {
    type: 'input',
    name: 'author',
    message: 'Author'
  }
]
answers = await inquirer.prompt(questions)

const cwdUrl = pathToFileURL(`${process.cwd()}/`)
const templateVariables = answers
renderTemplate({
  template: answers.template || argv.template,
  templateVariables,
  outputDir: new URL(`./${argv._[0] || argv.template}/`, cwdUrl)
})