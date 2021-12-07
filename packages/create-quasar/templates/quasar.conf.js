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
      optimizeDeps: {
        exclude: [
          '@quasar/quasar-ui-qcalendar',
          '@quasar/quasar-ui-qmarkdown'
        ]
      },
    },
    fastify: {
      
    }
  }
}