const pages = import.meta.glob('../pages/**/*.vue')
export default Object.keys(pages)
  .filter(page => page.split('/').length === 4)
  .map(page => page.slice(9))