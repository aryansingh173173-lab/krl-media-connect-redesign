# Media Connect · 14 September 2026

## Local development

This is a static site with no build step. From the project folder, run:

```sh
npx --yes serve . --listen 8000 --no-clipboard
```

Open http://localhost:8000. Run `node scripts/verify.mjs` to check local asset references, section links, and bilingual content coverage.

## Journal redesign

The visual design uses the supplied phthalo green (`#133215`), olive (`#92B775`), and eggshell (`#F3E8D3`) palette. The existing editorial serif, sans-serif, and locally hosted Bengali fonts remain consistent across the site. Language selection persists on the device.

- `index.html`: the six-chapter journal, original poster, programme, press downloads, and image dialog.
- `styles.css`: responsive layouts, typography, motion preferences, and component styling.
- `content.js` and `app.js`: English/Bengali copy and interactions.
- `archive.js`: bilingual captions and categories for 58 photographs from the supplied Assets archive. Two duplicate photographs are excluded from the gallery.
- `images/archive-print` and `images/archive-photos`: copies of the supplied print and photograph assets, with descriptive filenames preserved. The source Assets folder is untouched.

The gallery adds four photographs from the existing site and seven event clips. The existing web-encoded testimonial (about 25 MB) is retained instead of serving the 156 MB source master. The original poster is presented as printed artwork, not an event photograph.

All nine local videos use muted inline autoplay without native player chrome. Sources load when they enter view; videos pause off screen, when the tab is hidden, or when the image dialog opens. Visitors can pause, enable sound, and restart the testimonial. Reduced-motion preferences disable automatic playback. Audio requires a user gesture because browsers block unprompted audible autoplay. External YouTube coverage remains available through direct links.

The image dialog supports arrow keys, Escape, touch swipes, and opening the original image. The gallery can be filtered and expanded progressively.

`motion.js` adds the kinetic story layer: the bilingual opening transition, per-character title entrance, scroll reveals, chapter rail, moving type ribbons, subtle pointer-responsive poster and cards, magnetic controls, reactive video light, and animated image viewer. The system follows reduced-motion preferences and removes pointer effects on touch devices.

Bilingual (English / Bangla) photo essay of the Bharatiya Krishak Samaj West Bengal Media Connect at Rabindra Okakura Bhawan.

**Live:** https://krl-media-connect.vercel.app

Krishi Ratna League Bengal launch. Felicitation of Smt. Rinku Majumder Ghosh as Adhyaksha, Mahila Wing. Guest of Honour Shri Debashish Dhar, MLA, Sonarpur Uttar. Video testimonial of Shri Partha S. Chatterjee, Global Ambassador, BKS West Bengal.

Masthead: Bharatiya Krishak Samaj × KarmYog for the 21st Century.

## Media section

`#media` is the running record of coverage. It carries the YouTube film of the session, press clippings, and the downloadable press kit. New coverage is added to that section as it appears.

Current items:

- Video: https://youtu.be/cXO3fjWX-jg
- _Hello Evening Kolkata_, page 07, 14 September 2026 — "Focus on better facilities for Farmers in WB" (Asish Basak). Clipping `images/press-clip-hello-kolkata.jpg`, page PDF `press/Hello-Evening-Kolkata-14-Sep-2026-page-7.pdf`.
- Press release, English and Bangla, ref BKS-WB/PR/2026/09-14 — `press/BKS-KY21C-Press-Release-14-Sep-2026.pdf`, downloadable from the page.
