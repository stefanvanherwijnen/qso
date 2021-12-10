export const getAppExtensionPath = (name: string) => {
  if (name.charAt(0) === '@') {
    const slashIndex = name.indexOf('/')
    if (slashIndex === -1) {
      throw new Error(`Invalid Quasar App Extension name: "${name}"`)
    }

    return name.substring(0, slashIndex + 1) +
      'quasar-app-extension-' +
      name.substring(slashIndex + 1)
  }
  else {
    return 'quasar-app-extension-' + name
  }
}