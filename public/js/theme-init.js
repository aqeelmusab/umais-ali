;(() => {
  try {
    const stored = localStorage.getItem('theme')
    const theme = stored === 'dark' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'light')
  }
})()
