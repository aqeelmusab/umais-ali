;(() => {
  try {
    const stored = localStorage.getItem('theme')
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    const prefers = prefersLight ? 'light' : 'dark'
    const theme = stored === 'light' || stored === 'dark' ? stored : prefers
    document.documentElement.setAttribute('data-theme', theme)
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'light')
  }
})()
