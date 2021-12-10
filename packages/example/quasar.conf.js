export default function (ctx) {
  return {
    boot: [
      'urql.js',
      'test.js',
      'qcalendar.js'
    ],
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
    css: [
      '~@quasar/quasar-ui-qcalendar/src/index.sass'
    ],
    fastify: {
      setup: (fastify) => console.log('test fastify')
    }
  }
}