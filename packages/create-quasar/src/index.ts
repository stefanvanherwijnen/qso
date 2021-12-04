import { Console } from 'console'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import Handlebars from 'handlebars'

export const renderAll = ({
  inputPath,
  outputPath,
  templateVariables,
  exclude = ['Markdown.vue']
}:{
  inputPath: URL,
  outputPath: URL,
  templateVariables: Record<string, any>,
  exclude?: string[]
}) => {
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath)
  }
  const content = readdirSync(inputPath, { withFileTypes: true })
  const files = content.filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name)
  const directories = content.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)

  for (let file of files) {
    const fileContent = readFileSync(new URL(`./${file}`, inputPath), 'utf-8')
    const fileOutputPath = new URL(file.replace('.hbs', ''), outputPath)
    const template = Handlebars.compile(fileContent)
    const compiled = template(templateVariables)

    writeFileSync(fileOutputPath, compiled, 'utf-8')
  }

  for (let directory of directories) {
    renderAll({
      inputPath: new URL(`./${directory}/`, inputPath),
      outputPath: new URL(`./${directory}/`, outputPath),
      templateVariables
    })
  }
}

export const render = ({
  inputPath,
  outputPath,
  templateVariables
}: {
  inputPath: URL,
  outputPath: URL,
  templateVariables: Record<string, any>
}) => {
  const outputFolder = new URL('./', outputPath)
  if (!existsSync(outputFolder)) {
    mkdirSync(outputFolder)
  }
  const fileContent = readFileSync(new URL(inputPath), 'utf-8')
  const template = Handlebars.compile(fileContent)
  const compiled = template(templateVariables)

  writeFileSync(outputPath, compiled, 'utf-8')
}

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

export const renderTemplate = ({
  template,
  outputDir
}: {
  template: string,
  outputDir: URL
}) => {
  if (outputDir.pathname[outputDir.pathname.length - 1] !== '/') {
    throw new Error('outputDir is not a directory. Make sure the URL ends with a /')
  }
  const templatesDir = new URL(`../templates/`, import.meta.url)
  const templateDir = new URL(`../templates/${template}/`, import.meta.url)

  /**
   * General Quasar project files
   */
  render({
    inputPath: new URL('./package.json', templatesDir),
    outputPath: new URL(`./package.json`, outputDir),
    templateVariables
  })
  render({
    inputPath: new URL('./quasar.conf.js', templatesDir),
    outputPath: new URL(`./quasar.conf.js`, outputDir),
    templateVariables
  })
  render({
    inputPath: new URL('./index.html', templatesDir),
    outputPath: new URL(`./index.html`, outputDir),
    templateVariables
  })

  /**
   * Specific template files
   */
  renderAll({
    inputPath: new URL(`./`, templateDir),
    outputPath: new URL(`./`, outputDir),
    templateVariables
  })
}

// renderTemplate({
//   template: 'quasar-ts',
//   outputDir: new URL('./generated/', import.meta.url)
// })