import { renderTemplate } from './render.js'
import parseArgs from 'minimist'
import { pathToFileURL } from 'url'
import inquirer, { QuestionCollection } from 'inquirer'
import { promises } from 'fs'

const templateVariables = {
  packageJson: {
    name: 'Test',
    author: 'John',
    description: 'Description',
    license: 'License',
    dependencies: []
  },
  app: {
    title: 'Test'
  }
}

const templates = (await promises.readdir(new URL('../templates/', import.meta.url), { withFileTypes: true }))
  .filter((file) => file.isDirectory())
  .map((file) => file.name)

const argv = parseArgs(process.argv.slice(2), {
  string: ['template'],
})

let answers: Record<string, any>
let template: string
if (!argv.template) {
  // throw new Error('Please provide a template argument: --template')
  const questions: QuestionCollection = [
    {
        type: 'list',
        name: 'template',
        message: 'Which template would you like to use?',
        choices: templates
    }
  ]
  answers = await inquirer.prompt(questions)

  template = answers.template
} else {
  template = argv.template
}

const cwdUrl = pathToFileURL(`${process.cwd()}/`)

renderTemplate({
  template,
  outputDir: new URL(`./${argv._[0] || argv.template}/`, cwdUrl),
  templateVariables
})