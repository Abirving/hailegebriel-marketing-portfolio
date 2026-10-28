/* Applied before first paint so the page never flashes the wrong theme.
   Kept as a separate same-origin file because the production CSP on Vercel
   only allows `script-src 'self'`, which blocks inline scripts. */
(function () {
  var COLORS = { light: '#e9f5ef', dark: '#0d0f0e' };

  function resolve() {
    try {
      var stored = window.localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (error) {
      /* Storage can be blocked; fall back to the system preference. */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  var theme = resolve();
  document.documentElement.dataset.theme = theme;

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', COLORS[theme]);
})();
