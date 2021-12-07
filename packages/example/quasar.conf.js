export default function (ctx) {
  return {
    boot: [
      'test.js',
      'qcalendar.js'
    ],
    extras: [
      'mdi-v5',
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
    css: [
      '~@quasar/quasar-ui-qcalendar/src/index.sass'
    ],
    vite: {
      // build: {
      //   minify: true
      // },
      resolve: {
        alias: [
          // { find: '@quasar/quasar-ui-qcalendar', replacement: '@quasar/quasar-ui-qcalendar/src/index' }
        ]
      },
      optimizeDeps: {
        exclude: ['@quasar/quasar-ui-qcalendar']
      },
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