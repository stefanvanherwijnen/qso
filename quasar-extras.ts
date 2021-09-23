// For lack of a better solution of semi-dynamic imports

export const importQuasarExtras = {
  'material-icons': () => import('@quasar/extras/material-icons/material-icons.css'),
  'roboto-font': () => import('@quasar/extras/roboto-font/roboto-font.css'),
  'roboto-font-latin-ext': () => import('@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css'),
  'material-icons-outlined': () => import('@quasar/extras/material-icons-outlined/material-icons-outlined.css'),
  'material-icons-round': () => import('@quasar/extras/material-icons-round/material-icons-round.css'),
  'material-icons-sharp': () => import('@quasar/extras/material-icons-sharp/material-icons-sharp.css'),
  'mdi-v6': () => import('@quasar/extras/mdi-v6/mdi-v6.css'),
  'mdi-v5': () => import('@quasar/extras/mdi-v5/mdi-v5.css'),
  'mdi-v4': () => import('@quasar/extras/mdi-v4/mdi-v4.css'),
  'mdi-v3': () => import('@quasar/extras/mdi-v3/mdi-v3.css'),
  'fontawesome-v5': () => import('@quasar/extras/fontawesome-v5/fontawesome-v5.css'),
  'ionicons-v4': () => import('@quasar/extras/ionicons-v4/ionicons-v4.css'),
  'eva-icons': () => import('@quasar/extras/eva-icons/eva-icons.css'),
  'themify': () => import('@quasar/extras/themify/themify.css'),
  'line-awesome': () => import('@quasar/extras/line-awesome/line-awesome.css'),
  'bootstrap-icon': () => import('@quasar/extras/bootstrap-icons/bootstrap-icons.css'),
}

// export const importExtras = (extras: string[]) => {
//   if (extras.includes('material-icons')) {
//     import('@quasar/extras/material-icons/material-icons.css')
//   }
//   if (extras.includes('roboto-font')) {
//     import('@quasar/extras/roboto-font/roboto-font.css')
//   }
//   if (extras.includes('roboto-font-latin-ext')) {
//     import('@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css')
//   }
//   if (extras.includes('material-icons-outlined')) {
//     import('@quasar/extras/material-icons-outlined/material-icons-outlined.css')
//   }
//   if (extras.includes('material-icons-round')) {
//     import('@quasar/extras/material-icons-round/material-icons-round.css')
//   }
//   if (extras.includes('material-icons-sharp')) {
//     import('@quasar/extras/material-icons-sharp/material-icons-sharp.css')
//   }
//   if (extras.includes('mdi-v6')) {
//     import('@quasar/extras/mdi-v6/mdi-v6.css')
//   }
//   if (extras.includes('mdi-v5')) {
//     import('@quasar/extras/mdi-v5/mdi-v5.css')
//   }
//   if (extras.includes('mdi-v4')) {
//     import('@quasar/extras/mdi-v4/mdi-v4.css')
//   }
//   if (extras.includes('mdi-v3')) {
//     import('@quasar/extras/mdi-v3/mdi-v3.css')
//   }
//   if (extras.includes('fontawesome-v5')) {
//     import('@quasar/extras/fontawesome-v5/fontawesome-v5.css')
//   }
//   if (extras.includes('ionicons-v4')) {
//     import('@quasar/extras/ionicons-v4/ionicons-v4.css')
//   }
//   if (extras.includes('eva-icons')) {
//     import('@quasar/extras/eva-icons/eva-icons.css')
//   }
//   if (extras.includes('themify')) {
//     import('@quasar/extras/themify/themify.css')
//   }
//   if (extras.includes('line-awesome')) {
//     import('@quasar/extras/line-awesome/line-awesome.css')
//   }
//   if (extras.includes('bootstrap-icons')) {
//     import('@quasar/extras/bootstrap-icons/bootstrap-icons.css')
//   }
// }