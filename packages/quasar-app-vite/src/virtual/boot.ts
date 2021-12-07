function lowerCamelCase (name: string) {
  return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
}
function removeSpecialCharacters (name: string) {
  return name.replace(/[^a-zA-Z ]/g, "")
}

export default (bootFilePaths: string[]) => {
const imports = bootFilePaths?.map((boot: string) => `import ${removeSpecialCharacters(boot)} from '${boot}'`).join('\n')
return `import quasarConf from 'virtual:quasar-conf'
${imports}

export default { ${bootFilePaths.map((boot) => removeSpecialCharacters(boot)).join(',\n')}}`
}