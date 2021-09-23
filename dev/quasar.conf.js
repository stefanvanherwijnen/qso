export default function (ctx) {
  return {
    boot: [
      { path: 'force-hmr', server: false },
      ctx.mode.ssr ? { path: 'ssr-client', server: false } : ''
    ],

    css: [],

    extras: [
      'ionicons-v4',
      'mdi-v6',
      'fontawesome-v5',
      'eva-icons',
      'themify',
      'line-awesome',
      'bootstrap-icons',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font',
      'material-icons-outlined',
      'material-icons-round',
      'material-icons-sharp',
      'material-icons'
    ],

    framework: {
      // iconSet: 'svg-mdi-v6',
      // config: { ripple: { early: true } },
      // config: {
      //   globalNodes: {
      //     class: 'mimi'
      //   }
      // },
      plugins: [
        'AddressbarColor',
        'AppFullscreen',
        'AppVisibility',
        'BottomSheet',
        'Cookies',
        'Dark',
        'Dialog',
        'Loading',
        'LoadingBar',
        'LocalStorage',
        'Meta',
        'Notify',
        'Platform',
        'Screen',
        'SessionStorage'
      ]
    },

    build: {
      rtl: false,
      vueRouterMode: 'history',
      // showProgress: false,
    },

    // supportTS: true,

    devServer: {
      https: false,
      port: 8080,
      open: true // opens browser window automatically
    },

    animations: [],

    ssr: {
      pwa: false,

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    },

    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW
      manifest: {
        name: 'Quasar App',
        short_name: 'Quasar App',
        description: 'A Quasar Framework app',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      bundler: 'packager', // 'packager' or 'builder'
      nodeIntegration: true
    }
  }
}
