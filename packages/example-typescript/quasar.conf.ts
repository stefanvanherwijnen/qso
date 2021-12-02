export default function (ctx) {
  return {
    boot: [],
    extras: [
      'material-icons'
    ],
    framework: {
      components: [
        'QBtn'
      ],
      plugins: [
        'Notify'
      ]
    },
    vite: {
      // build: {
      //   minify: true
      // },
      plugins: [
        {
          name: 'test-plugin',
          config: (config, env) => {
            console.log('Test plugin loaded')
            return config
          }
        }
      ]
    },
    fastify: {
      setup: (fastify) => console.log('test fastify')
    }
  }
}