export default function (ctx) {
  return {
    boot: [
      'test.js'
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
    vite: {
      plugins: [
        {
          name: 'test-plugin',
          config: (config, env) => {
            console.log('Test plugin loaded')
            return config
          }
        }
      ]
    }
  }
}