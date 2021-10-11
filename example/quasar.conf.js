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
    }
  }
}