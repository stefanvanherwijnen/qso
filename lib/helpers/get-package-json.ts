import appPaths from '@stefanvh/quasar-app-vite/lib/app-paths'

interface PackageJson {
  version: string
}
export default async function (pkgName: string, folder = appPaths.appDir): Promise<PackageJson | undefined> {
  // tsc copies the file to the dist folder so this does not work

  if (pkgName === '@stefanvh/quasar-app-vite') {
    // @ts-ignore
    return import('@stefanvh/quasar-app-vite/package.json')
  }

  try {
    return import(`${pkgName}/package.json'`)
    // return require(
    //   require.resolve(`${pkgName}/package.json`, {
    //     paths: [ folder ]
    //   })
    // )
  }
  catch (e) {}
}
