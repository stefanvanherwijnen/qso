function lowerCamelCase (name: string) {
  return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
}
function removeSpecialCharacters (name: string) {
  return name.replace(/[^a-zA-Z ]/g, "")
}
function packageName (name: string) {
  if (name.charAt(0) === '@') {
    const slashIndex = name.indexOf('/')

    return name.substring(0, slashIndex + 1) +
      'quasar-app-extension-' +
      name.substring(slashIndex + 1)
  }
  else {
    return 'quasar-app-extension-' + name
  }
}
export default (extensions: string[]) => {
  const imports = extensions.map((ext) => `import ${removeSpecialCharacters(ext)} from '${packageName(ext)}/index'`)

  return `${imports.join('\n')}
import qe from 'app/quasar.extensions.json'
export default { ${extensions.map((ext) => removeSpecialCharacters(ext)).join(',\n')}}`
}