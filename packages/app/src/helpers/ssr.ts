export const injectSsrContext = (html: string, ssrContext: Record<string, any>) => html.replace(
  /(<html[^>]*)(>)/i,
  (found, start, end) => {
    let matches

    matches = found.match(/\sdir\s*=\s*['"]([^'"]*)['"]/i)
    if (matches) {
      start = start.replace(matches[0], '')
    }

    matches = found.match(/\slang\s*=\s*['"]([^'"]*)['"]/i)
    if (matches) {
      start = start.replace(matches[0], '')
    }

    return `${start} ${ssrContext._meta.htmlAttrs || ''} ${end}`
  }
)
  .replace(
    /(<head[^>]*)(>)/i,
    (_, start, end) => `${start}${end}${ssrContext._meta.headTags || ''}`
  )
  .replace(
    /(<\/head>)/i,
    (_, tag) => `${ssrContext._meta.resourceStyles || ''}${ssrContext._meta.endingHeadTags || ''}${tag}`
  )
  .replace(
    /(<body[^>]*)(>)/i,
    (found, start, end) => {
      let classes = ssrContext._meta.bodyClasses || ''

      const matches = found.match(/\sclass\s*=\s*['"]([^'"]*)['"]/i)

      if (matches) {
        if (matches[1].length > 0) {
          classes += ` ${matches[1]}`
        }
        start = start.replace(matches[0], '')
      }

      return `${start} class="${classes.trim()}" ${ssrContext._meta.bodyAttrs || ''}${end}${ssrContext._meta.bodyTags || ''}`
    }
  )
  .replace(`<!--initial-state-->`, `<script>
  window.__INITIAL_STATE__ = ${JSON.stringify(ssrContext.initialState)}
</script>
`)
