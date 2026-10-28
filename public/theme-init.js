/* Applied before first paint so the page never flashes the wrong theme.
   Kept as a separate same-origin file because the production CSP on Vercel
   only allows `script-src 'self'`, which blocks inline scripts.
   The site is light-only, so the palette is pinned here and the dark
   tokens in styles.css stay dormant. */
document.documentElement.dataset.theme = 'light';
