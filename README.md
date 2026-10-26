# Hailegebriel Samuel — Digital Marketing Portfolio

A complete single-page React portfolio with a monochrome zinc palette, emerald growth indicators, self-hosted variable fonts, and a subtle interactive Three.js wireframe globe.

## Start locally

Install **Node.js 22.12 or newer**, then extract the ZIP, open a terminal inside `hailegebriel-marketing-portfolio`, and run:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Keep the terminal running while working. Use `npm install` only when intentionally updating dependencies; `npm ci` reproduces the included lockfile.

## Build and preview the production files

```bash
npm test
npm run build
npm run preview
```

Vite writes deployable static files to `dist/`. Preview the result at the URL printed by the preview command. Serve `dist/` over HTTP; opening `dist/index.html` with `file://` will not correctly load module assets.

## What is included

- React, Vite, Tailwind CSS 4, Lucide React, and Three.js.
- Responsive sticky navigation with a mobile menu and smooth anchor scrolling.
- A mouse-responsive, lazy-loaded wireframe globe. Rendering pauses off screen and in background tabs, honors reduced motion, caps pixel density/frame rate, and releases its GPU resources on unmount.
- A static CSS globe when WebGL 2 is unavailable.
- Three filterable case studies, each with a prominent **View Live Work** TikTok link and **Explore Case Study** button. Every supplied metric appears on the card and in its native accessible analytics dialog.
- Traffic-source distributions, dated spike comparisons, three top-post breakdowns, and audience demographics, with keyboard-operable dialog tabs.
- Native dialog focus containment, Escape/backdrop dismissal, and focus restoration.
- A capabilities bento grid covering Content Strategy, Algorithmic SEO & Discovery, Email & Retention Marketing, and Performance Analytics.
- Four methodology pillars: Strategic Thinker, Data-Driven, Content Creator, and Client-Focused.
- CSS hover and entrance transitions that respect reduced-motion preferences; no animation framework is required.
- A validated inquiry form, working `mailto:` and `tel:` actions, and a copy-message fallback.
- An optional Vercel serverless endpoint for direct email delivery.
- Metadata, a favicon, robots.txt, sitemap.xml, and deployment headers.
- Eight focused tests covering contact validation, encoding, provider handling, origins, body limits, and rate limiting.
- A cross-platform ZIP script that excludes dependencies, local secrets, and host metadata.

## Contact form: two explicit modes

### 1. Email draft — works immediately

The default mode requires no account, server, or secret. After validation, **Open email draft** opens the visitor’s configured email app with their name, reply address, project type, and message filled in. The visitor sends the email there.

The interface says that a draft is ready, rather than pretending that a message was sent. If no email app is configured, visitors can copy the message or use the direct email address. The phone action requires a device/app that handles telephone links.

The receiving address is `hailegebrielsamuel@gmail.com`. Confirm that you own and monitor it before using this site publicly.

### 2. Direct server delivery — optional Vercel setup

The included `api/contact.js` uses Resend over HTTPS. No browser-visible API key and no additional server package are needed.

1. Create a Resend account and verify a sending domain.
2. Add these values in your Vercel project’s environment settings:

   | Variable                 | Value                                                                     |
   | ------------------------ | ------------------------------------------------------------------------- |
   | `VITE_CONTACT_MODE`      | `api`                                                                     |
   | `RESEND_API_KEY`         | Your server-side Resend key                                               |
   | `CONTACT_FROM_EMAIL`     | A sender on your verified domain, e.g. `Portfolio <hello@yourdomain.com>` |
   | `CONTACT_TO_EMAIL`       | Your real receiving inbox; defaults to the supplied portfolio address     |
   | `CONTACT_ALLOWED_ORIGIN` | The exact public site origin, e.g. `https://hailegebriel.vercel.app`      |

3. Redeploy. `VITE_CONTACT_MODE` is embedded at build time.
4. Submit a real test yourself and confirm it reaches your inbox. The automated tests mock the provider and do not send messages.

Use `.env.example` as the template for local variables. Keep real keys in `.env.local`, which is excluded from both git and the ZIP. **Never add `VITE_` to a server secret.**

The plain Vite development server serves the frontend only; it does not run Vercel API functions. To exercise direct delivery locally, use Vercel CLI’s `vercel dev` with local environment variables and an allowed origin matching its printed URL. For example, if that URL is `http://localhost:3000`, use that exact value. Each deployment environment needs its own allowed origin. The frontend retains the message and offers email/copy fallbacks on delivery failure.

The endpoint validates fields, restricts request origin and content type, limits request size, checks a honeypot, sets a provider timeout, and imposes a best-effort limit of five valid attempts per ten minutes per IP per server instance. Serverless instances do not share memory; enable a host WAF rate-limit rule for `POST /api/contact` for durable abuse control on a busy public deployment.

## Deploy

### Vercel

Import the folder into a Vercel project or push it to your own Git repository and import that repository. The included `vercel.json` selects Vite, runs `npm run build`, serves `dist/`, and applies security/cache headers. The `api/` directory supplies the optional function. The code does not claim or publish to the supplied domain automatically.

### Other static hosts

Run `npm run build`, then upload `dist/` to your static host. The default email-draft form works without a backend. The Vercel function and headers require host-specific equivalents if you enable direct delivery elsewhere. There are no path-based routes, so SPA rewrite rules are unnecessary.

### Next.js adaptation

The included project is runnable Vite code. The components use normal React and can be moved to Next.js:

- Put `'use client';` at the top of the portfolio’s client entry.
- Import `styles.css` and the two font stylesheets from the root layout; configure Tailwind using the Next.js integration instead of the Vite plugin.
- Replace `import.meta.env.VITE_CONTACT_MODE` in `ContactForm.jsx` with `process.env.NEXT_PUBLIC_CONTACT_MODE`.
- Keep the globe’s setup inside its effect; it does not touch browser globals during rendering.
- For Next.js App Router, port the Node handler to an `app/api/contact/route.js` route using `Request`/`Response`; the provided handler already fits the Vercel Functions/Pages API style.

## Edit the content

| File                                  | Purpose                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/App.jsx`                         | Page composition, navigation, hero, about, contact, and footer                     |
| `src/data.js`                         | Profile, contact details, case-study metrics, live URLs, capabilities, and pillars |
| `src/styles.css`                      | Tailwind theme, reusable components, responsive layouts, and motion preferences    |
| `src/styles/`                         | Case-study and capabilities/methodology styles                                     |
| `src/components/WireframeGlobe.jsx`   | Three.js scene, interaction, fallback, and cleanup                                 |
| `src/components/CaseStudies.jsx`      | Filterable project grid and comparison graphics                                    |
| `src/components/ProjectAnalytics.jsx` | Shared metric summaries, post results, traffic, and demographics                   |
| `src/components/LiveWorkLink.jsx`     | External TikTok links with accessible names and safe new-tab attributes            |
| `src/components/ProjectModal.jsx`     | Accessible analytics dialog and tabs                                               |
| `src/components/Capabilities.jsx`     | Four-capability bento grid                                                         |
| `src/components/Methodology.jsx`      | Four strategic pillars                                                             |
| `src/components/ContactForm.jsx`      | Form, validation feedback, and delivery modes                                      |
| `src/lib/contact.mjs`                 | Shared validation and email-draft construction                                     |
| `api/contact.js`                      | Optional server-side email delivery                                                |
| `index.html`                          | Page title, SEO, and canonical domain                                              |
| `public/`                             | Favicon, robots.txt, and sitemap.xml                                               |
| `scripts/package.mjs`                 | Reproducible source/build ZIP packaging                                            |

When changing the receiving address, update both `src/data.js` and `src/lib/contact.mjs` (and your server environment if using API mode). When changing the public domain, update `index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/data.js`, and `CONTACT_ALLOWED_ORIGIN`.

Fonts are bundled locally through Fontsource. Brand marks are simple typeset names with Lucide symbols, not official brand logos. No external images, tracking scripts, or Google Fonts requests are needed.

## Metric provenance and presentation

All figures are reproduced from the supplied project briefs. **No PDF was attached**, so no independent PDF verification is claimed. Dialog source notes retain the supplied portfolio reference numbers (WALTA 6, CHENET 5, HABESHA 7); these numbers are not fabricated report links. The live TikTok URLs are the exact URLs supplied in the brief. Their external availability is controlled by TikTok.

- **WALTA GPS:** 203K → 84.9M views; 5.5K → 2.2M likes; 611 → 169.8K shares; 217.3K profile views; 12.5K comments. Traffic: For You Page 85.1%, Search 11.2%, Following 1.8%, Personal Profile 1.5%. The supplied growth percentages are retained; rounded totals may produce small recalculation differences.
- **CHENET P.L.C:** below 100K views per spike in August 2025 → approximately 900K in February 2026, approximately 9× reported lift, sustained through mid-2026. Totals: 46.8M views, 1.1M likes, 52.1K shares, 119.4K profile views, 4.1K comments. Traffic: For You Page 92.7%, Personal Profile 1.8%, Search 1.7%, Following 1.4%. Its baseline bar shows the 100K upper bound, not an invented exact baseline.
- **HABESHA BYTES:** approximately 4.4K followers, 3.71% reported top-post conversion, nearly 7× the account average. Smart Glass Review: 547K views / +2.0K net new followers. 4 Must-Have Tech Applications: 35K views / +1.3K net new followers. Cool Pen Tech Showcase: 87K views / +714 net new followers. The 3.71% metric is separate from these rounded post values; no aggregate conversion rate is invented. Audience: 42.7% aged 25–34, 24.5% aged 35–44, 19.9% aged 18–24; 72% male / 28% female.

Traffic and age charts retain the stated percentages. The unreported remainder is labeled **Unlisted / rounding** (WALTA 0.4%, CHENET 2.4%, age groups 12.9%) instead of rescaling supplied values to imply a complete breakdown.

The graphics show reported comparisons, rather than fabricated daily performance curves. No paid-spend, revenue, ROI, or unsupplied time series is invented.

## Package into a ZIP

From the project folder:

```bash
npm run build
npm run package
```

The output is `artifacts/hailegebriel-marketing-portfolio.zip`. The archive contains a single `hailegebriel-marketing-portfolio/` folder with complete source, the lockfile, configuration, documentation, tests, and the latest existing `dist/` build. It excludes `node_modules`, `.git`, `.env`, `.env.local`, `.vercel`, and previous archives; `.env.example` is included. The ZIP uses the standard uncompressed ZIP format for portability, so the output is larger than a compressed archive.

To package manually, select the same project files and `dist/` in your file manager and use **Compress / Send to compressed folder**. Leave out `node_modules`, local `.env*` files other than `.env.example`, and `artifacts/`.

## Validation notes

The production build and eight automated contact tests passed in the creation environment. Desktop and mobile browser checks cover navigation, case-study filtering, dialogs, keyboard tabs, focus restoration, and contact validation. This environment’s browser disables WebGL; its static fallback was visually checked. Validate the animated globe on a WebGL-capable target device before launch. Real inbox delivery requires your own configured sender, API key, and receiving inbox, and was not exercised here.

## Reference documentation

- [Vite](https://vite.dev/guide/)
- [Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer)
- [Resend email API](https://resend.com/docs/api-reference/emails/send-email)
