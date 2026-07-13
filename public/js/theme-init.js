;(() => {
  try {
    const stored = localStorage.getItem('theme')
    const theme = stored === 'dark' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    // Keep the browser's own chrome (iOS Safari status/toolbar tint,
    // Android Chrome address bar) matching the SITE's actual active theme
    // rather than the OS's prefers-color-scheme, since a user can toggle
    // the theme independently of their OS setting. Runs before first paint
    // (this script is loaded synchronously in <head>) so there's no flash
    // of mismatched browser-chrome color on load.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#fbf8f1')
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'light')
  }
})()
