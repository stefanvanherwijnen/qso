export default {
  quasar: {
    conf: function (ctx) {
      return {
        boot: [],
        extras: [
          'material-icons'
        ],
        framework: {
          components: [
            // Deprecated
          ],
          plugins: [
          ]
        },
      }
    },
    fastify: {
      // Fastify configuration for SSR
    },
    sassVariables: {
      // quasar-variables.sass
    },
  }
}