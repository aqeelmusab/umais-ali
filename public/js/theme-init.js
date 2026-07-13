;(() => {
  try {
    var stored = localStorage.getItem('theme')
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    var prefers = prefersLight ? 'light' : 'dark'
    var theme = stored === 'light' || stored === 'dark' ? stored : prefers
    document.documentElement.setAttribute('data-theme', theme)
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'light')
  }
})()
