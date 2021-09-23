import { resolve, relative, dirname } from 'path'

const plugins = (paths) => {
  return [
    {
      config: (config, env) => {
        config.resolve.alias.push(
          { find: 'pages', replacement: paths.resolve.src('pages') }
        )
        return config
      }
    }
 ]
}

export default plugins