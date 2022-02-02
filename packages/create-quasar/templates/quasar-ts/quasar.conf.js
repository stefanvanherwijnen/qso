export default function (ctx) {
  return {
    boot: [],
    extras: [
      'material-icons'
    ],
    framework: {
      components: [
      ],
      plugins: [
      ]
    },
    vite: {
      // Vite configuration
    },
    fastify: {
      // Fastify configuration for SSR
    },
    sassVariables: {
      // Or use src/quasar-variables.sass
    },
    appExtensions: {
      // Or use quasar-extensions.json
    }
  }
}