# Omadbek Xoshimov — Portfolio

A single-page personal portfolio for **Xoshimov Omadbek**, Full-Stack Web Developer
based in Tashkent, Uzbekistan.

Hand-written semantic HTML5, one CSS file and one vanilla-JS file. No build step,
no framework, no server. Clone it, open `index.html`, and it works — or deploy it
to GitHub Pages in about two minutes.

---

## Table of contents

- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Before you publish — replace these placeholders](#before-you-publish--replace-these-placeholders)
- [Run it locally](#run-it-locally)
- [Project structure](#project-structure)
- [What's in it](#whats-in-it)
- [Design system](#design-system)
- [How it was built](#how-it-was-built)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Browser support](#browser-support)
- [Swapping the font](#swapping-the-font)
- [Converting the images to WebP](#converting-the-images-to-webp)
- [Credits](#credits)
- [License](#license)

---

## Deploy to GitHub Pages

The site must be served from the root of a domain, so use a **user site** repo
(`<your-username>.github.io`) rather than a project repo. A project repo would
publish to `https://<your-username>.github.io/<repo>/`, and the absolute paths in
`404.html`, `sitemap.xml` and the manifest assume the root.

### Step 1 — Create the repository

On GitHub: **New repository** → name it `omadbekxoshimov.github.io` (must match
your username exactly) → set visibility to **Public** (private repos need a paid
plan for Pages) → **Create repository**. Do *not* tick "Add a README".

### Step 2 — Push this project

```bash
git remote add origin https://github.com/omadbekxoshimov/omadbekxoshimov.github.io.git
git branch -M master
git push -u origin master
```

### Step 3 — Turn on Pages

**Settings → Pages → Build and deployment → Source → Deploy from a branch** →
select `master` and `/ (root)` → **Save**.

The site is live at `https://omadbekxoshimov.github.io/` within a minute or two.
GitHub serves the files as-is; the included `.nojekyll` stops Jekyll from
swallowing anything.

> **Don't want the workflow?** `.github/workflows/deploy.yml` is included and
> already works. If you'd rather publish straight from the branch, delete that
> one file. If you *keep* it, set **Settings → Pages → Source → GitHub Actions**
> instead of "Deploy from a branch" — using both at once will fight over the
> deploy.

### Step 4 — Update the canonical URL

If you publish somewhere other than `omadbekxoshimov.github.io`, replace that URL
in four places in `index.html` (lines 18, 27, 28, 36), and in `sitemap.xml`,
`robots.txt` and `site.webmanifest`.

---

## Before you publish — replace these placeholders

Everything below is marked with `[BRACKETS]` in the source so it is easy to find.
Search `index.html` for `[` to get the full list.

| Placeholder | Where | Notes |
| --- | --- | --- |
| `[LIVE_DEMO_URL]` | 5 project cards | Link to the deployed project. |
| `[GITHUB_REPO_URL]` | 2 project cards | Link to the source repository. |
| `[API_DOCS_URL]` | TaskFlow API card | Link to the docs (Swagger, Redoc…). |
| `[CLIENT_NAME]` | 4 testimonials | **Do not ship these as-is** — see below. |
| `[CLIENT_ROLE · COMPANY]` | 4 testimonials | Same. |
| `[YOUR_LINKEDIN]` | Footer | Your LinkedIn username. |
| `[YOUR_INSTAGRAM]` | Footer | Your Instagram username. |
| `[YOUR_FORMSPREE_ID]` | Contact form | See the form section below. |
| `assets/Xoshimov-Omadbek-CV.pdf` | Hero "Download CV" | **The file does not exist yet** — add it, or remove the link. The button is already wired to that path. |
| `data-count="4\|25\|20\|100"` | About counters | I made these up as placeholders. Set them to your real projects / years / clients. |

A one-liner to find them all (note the middle dot in the character class, which
catches `[CLIENT_ROLE · COMPANY]`):

```bash
grep -nE '\[[A-Z_][A-Z_ ·]*\]' index.html
```

That should return 8 distinct placeholders across 19 lines. Two more things to
remember that the pattern can't catch:

- `assets/Xoshimov-Omadbek-CV.pdf` — the hero's "Download CV" link points at a
  file that isn't in the repo. Add the PDF or remove the link.
- The canonical and Open Graph URLs (`omadbekxoshimov.github.io`) — only needs
  changing if you publish to a different domain.

### About the testimonials

The four quotes in the Testimonials section are **placeholder copy**. Testimonials
are the one thing a visitor is likely to take at face value, so either replace
them with real, attributable quotes, or delete the whole section. Do not ship
invented attributions.

### About the contact form

The form posts to [Formspree](https://formspree.io), which is free for static
sites and needs no server code:

1. Create a form at formspree.io and copy the form ID — it looks like `abc123xy`.
2. Replace `[YOUR_FORMSPREE_ID]` in the `action` attribute (line 1036).
3. Submit a test message and confirm it arrives.

Until that ID is filled in, `js/main.js` detects the leftover `[` and shows a
clear "this form is not connected yet — email me directly" message instead of
silently failing. So the page degrades honestly, but the form is not actually
delivering mail until you set it up.

The form also carries a honeypot field and a `_next` redirect back to
`?sent=1`; both are handled by Formspree and need no changes.

---

## Run it locally

The site is plain static files, so any server works. A one-liner with Python:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` mostly works, but the browser will
block the CDN scripts under some file:// policies, so use a real server when you
are testing the animations.

---

## Project structure

```
.
├── index.html              # the entire page: markup + inline SVG icon sprite
├── 404.html                # not-found page (absolute paths, for root hosting)
├── site.webmanifest        # PWA manifest (name, icons, theme colour)
├── robots.txt
├── sitemap.xml
├── .nojekyll               # stops GitHub Pages' Jekyll from touching anything
├── .github/
│   └── workflows/
│       └── deploy.yml      # optional: automatic deploy on every push
├── css/
│   └── styles.css          # the whole design system, ~62 KB unminified
├── js/
│   └── main.js             # all behaviour, ~43 KB unminified
└── assets/
    ├── me.png              # portrait, 324×761 (desktop)
    ├── me-sm.png           # portrait, 223×522 (≤720px viewports)
    ├── og-image.png        # 1200×630 social share card
    ├── favicon.svg
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable.png   # PWA icons
    ├── Xoshimov-Omadbek-CV.pdf   # ← you need to add this
    └── projects/
        ├── 01-nexus-commerce.svg
        ├── 02-taskflow-api.svg
        ├── 03-analytics-studio.svg
        ├── 04-uzmarket-bot.svg
        ├── 05-novastudio-cms.svg
        └── 06-clinicflow.svg
```

Everything referenced by the page is committed — there is no dependency on
anything outside the repo except the Google Fonts and the three CDN scripts
listed under [How it was built](#how-it-was-built).

---

## What's in it

**Hero.** The portrait sits on a layered 3D stage that tilts toward the pointer
and reacts to device orientation on mobile. It has a breathing glow, a spotlight
that tracks the cursor, tech icons orbiting on two rings, a word-by-word title
reveal, a typewriter subtitle, and CTAs that pull toward the cursor.

**About.** Animated counters and a bento grid of facts.

**Skills.** Two counter-scrolling marquees and four animated progress rings.

**Projects.** Six tilt-on-hover cards. Each opens a native `<dialog>` case study
written with the problem, the approach and what was actually built. Two of the
six are backend projects (a REST API and a Telegram bot) so the range is not
frontend-only.

**Experience.** A vertical timeline whose rule fills as you scroll.

**Services.** Six offerings in a grid.

**Testimonials.** An auto-advancing carousel with dots, arrows, keyboard
navigation, and a pause on hover or focus.

**Contact.** A validated form (Formspree) plus direct links to GitHub, Telegram
and email, over a large footer.

Throughout: a sticky glass navbar with an active-section pill and scroll-progress
bar, a custom cursor on pointer devices, a page preloader, a light/dark toggle,
and smooth scrolling.

---

## Design system

All tokens live at the top of `css/styles.css` as CSS custom properties.

**Colour.** Dark is the default. The light theme is a second block of token
overrides on `[data-theme="light"]` — it re-declares the tokens rather than
duplicating any rules, so a new element is themed for free just by using
variables.

Accent colours come in two flavours, and the distinction matters:

- `--violet`, `--cyan`, `--mint` — the brand hues, tuned for light-on-dark.
  Use these for **icons, borders and gradients**.
- `--violet-ink`, `--cyan-ink`, `--mint-ink` — the same hues re-mixed to clear
  **4.5:1 contrast as text**. Use these for **copy**.

In dark mode the two are identical, so nothing changes. On the light background
`#8b5cf6` is only 3.93:1 and `#22d3ee` only 1.68:1 — both fail AA as small text,
which is why the `-ink` variants exist. Every piece of accent-coloured text on the
page uses them.

**Type.** Space Grotesk for display, Inter for body, the platform's monospace for
code. Fluid `clamp()` sizing throughout, so type scales with the viewport rather
than jumping at breakpoints.

**Layout.** One container width (`--container`), one gutter (`--gutter`), and a
spacing rhythm based on `rem`. Every content grid uses
`grid-template-columns: minmax(0, 1fr)` — the `minmax(0, …)` matters, because
plain `1fr` lets a long unbreakable string (a code block, a URL) blow the track
out and create horizontal overflow.

---

## How it was built

**No build step, by design.** The files in this repository are the files that get
served. There is no `package.json`, no bundler and no transpiler, so there is
nothing to install, nothing to break and nothing to keep in sync.

**Three CDN scripts**, all with `defer` and all guarded at runtime:

| Script | Version | Purpose | If it fails |
| --- | --- | --- | --- |
| `gsap` | 3.12.5 | Scroll-triggered reveals | falls back to `IntersectionObserver` |
| `ScrollTrigger` | 3.12.5 | Same | falls back to `IntersectionObserver` |
| `lenis` | 1.1.14 | Smooth scrolling | falls back to native smooth scroll |

`js/main.js` checks for each global before use, so a blocked CDN, an ad blocker
or a flaky connection degrades the page instead of breaking it.

**Progressive enhancement.** An inline script in `<head>` sets `html.js` and
applies the saved theme before first paint, so there is no flash of the wrong
theme. The `.reveal` elements — which start hidden — are only hidden when that
class is present, so with JavaScript disabled the page is simply a static,
fully readable document. A timer-gated failsafe reveals everything within 2.5s
even if `main.js` itself never runs, so content can never get stuck invisible.

**Reveals.** When GSAP is present, `ScrollTrigger.batch` animates elements in
groups; otherwise `IntersectionObserver` does the same job. Both paths converge
on the same CSS classes, so the visual result is identical.

**Depth.** The hero's parallax layers are separated using CSS custom properties.
JS writes `--px` / `--py` on the stage, and each `[data-depth]` child scales
itself by its own `--depth`. The keyframe animations deliberately animate
`translate` / `scale` / `rotate` as *independent properties* rather than
`transform`, so they compose with the transform JS is writing instead of
overwriting each other.

**Testimonials** use native scroll-snap (`overflow-x: auto` plus
`scroll-snap-align: start`) rather than a hand-rolled transform slider, so
momentum scrolling and trackpad gestures work for free. One slide is shown per
viewport at every breakpoint: showing two at once makes the last slide's scroll
position saturate, which desynchronises the dots from the actual scroll offset.

**Project modal** is a native `<dialog>`, so focus trapping, `Esc` to close and
backdrop dismissal are the browser's job rather than a reimplementation. The
triggers are hidden entirely without JavaScript, so a visitor is never offered a
button that cannot work.

**Depth over cleverness.** Content is real HTML with real headings and real
links; the effects sit on top of it. The page reads correctly with animations
disabled, and `prefers-reduced-motion` removes the orbits, marquees, parallax,
typewriter and cursor outright rather than merely shortening them.

---

## Performance

- **21 files, ~960 KB total**, and the largest single asset is the 324 KB
  desktop portrait.
- The portrait is served in **two sizes**: `me-sm.png` (154 KB) to viewports
  ≤720px and `me.png` (324 KB) above, via `<picture>` + `<source media>`. Mobile
  never downloads the large file.
- The hero portrait is **preloaded**, since it is the Largest Contentful Paint
  element; the project covers are `loading="lazy"`.
- The six project covers are **SVGs** totalling 35 KB — smaller and sharper than
  raster alternatives would be.
- Icons are a single **inline SVG sprite**, so there is no icon-font request and
  no flash of missing glyphs.
- Fonts load with `preconnect` + `display=swap`, and the fallback stack is
  metric-similar so the swap is barely visible.
- The preloader reports **real progress** from actual asset loading, with a hard
  timeout as a safety net so it can never trap the page.

Two honest caveats: the page loads three CDN scripts (125 KB raw, 48 KB gzipped
combined) and two Google Fonts, and it uses `backdrop-filter` for the glass
effect. If you ever want a faster, dependency-free version, self-hosting the
fonts and dropping Lenis in favour of native `scroll-behavior: smooth` are the
two biggest wins — both are contained changes.

---

## Accessibility

Verified with a scripted audit (headless Chrome, both themes, plus a
`prefers-reduced-motion` pass), not just by eye.

- **Contrast.** Every text/background pair clears WCAG AA (4.5:1 for body text,
  3:1 for large text). This is what the `-ink` accent tokens exist for.
- **Reduced motion.** `prefers-reduced-motion: reduce` hides the orbiting icons,
  marquees, grain, orbs, parallax, typewriter and custom cursor, and turns
  counters and progress rings into their final values immediately instead of
  waiting for a scroll that may never happen.
- **Keyboard.** A skip link, visible focus rings, and a logical tab order. The
  project dialog traps focus and closes on `Esc` or a backdrop click. The
  carousel's dots are a proper `role="tablist"` with a roving tabindex, so
  `←` `→` `Home` `End` move between testimonials and focus follows the selection.
- **Semantics.** One `h1`, eight `h2`s, no skipped heading levels, landmarks for
  header / nav / main / footer, `lang="en"`, and every icon marked
  `aria-hidden` so screen readers announce no stray graphics.
- **Target size.** All interactive controls are at least 24×24px (WCAG 2.5.8);
  the carousel dots are 28×28 hit areas around an 8×8 visual pill.
- **Forms.** Real `<label>`s, `aria-invalid` on rejected fields, and error
  messages tied to their inputs.

**Known gaps, stated plainly:** the testimonials are placeholder copy, the
project case studies are plausible reconstructions rather than documented real
projects, and the CV file does not exist. Those are content problems, not code
problems, and no amount of polish substitutes for filling them in honestly.

---

## Browser support

Current Chrome, Edge, Firefox and Safari — desktop and mobile. The page degrades
rather than breaking on older browsers:

| Feature | Fallback |
| --- | --- |
| No JS | Static, readable document; all content visible |
| No GSAP | `IntersectionObserver` reveals |
| No Lenis | Native smooth scroll |
| No native `<dialog>` | Case-study buttons removed instead of dead |
| No `backdrop-filter` | Opaque-ish surfaces |
| No `IntersectionObserver` | Counters and rings settle immediately |

---

## Swapping the font

The page uses **Space Grotesk + Inter** from Google Fonts. The `--font-display`
stack in `css/styles.css` already lists `Clash Display` as its second choice, so
if you want Clash Display (Fontshare) instead:

1. Add the Fontshare `<link>` to the `<head>` in `index.html`, with `preconnect`
   to `api.fontshare.com` the same way Google Fonts is preconnected.
2. Leave the CSS alone — `--font-display` already falls through to
   `"Clash Display"`.

The same applies to the body face: set `--font-body` and it applies everywhere.

---

## Converting the images to WebP

The PNGs ship as PNGs because the machine this was built on had no WebP encoder.
WebP would cut them by roughly 70%:

| File | Now | As WebP (approx.) |
| --- | --- | --- |
| `assets/me.png` | 324 KB | ~95 KB |
| `assets/me-sm.png` | 154 KB | ~48 KB |
| `assets/og-image.png` | 206 KB | ~70 KB |

To convert (any one of these is enough):

```bash
# cwebp — https://developers.google.com/speed/webp/download
cwebp -q 82 assets/me.png -o assets/me.webp
cwebp -q 82 assets/me-sm.png -o assets/me-sm.webp
cwebp -q 88 assets/og-image.png -o assets/og-image.webp
```

```bash
# or ImageMagick
magick assets/me.png -quality 82 assets/me.webp
```

Then point the markup at the new files. The portrait already uses `<picture>`, so
only the source list needs extending:

```html
<picture>
  <source type="image/webp" srcset="assets/me-sm.webp" media="(max-width: 720px)">
  <source type="image/webp" srcset="assets/me.webp">
  <source type="image/png" srcset="assets/me-sm.png" media="(max-width: 720px)">
  <img src="assets/me.png" alt="Portrait of Xoshimov Omadbek, full-stack" …>
</picture>
```

Every browser that can run this page supports WebP, so the PNGs become a
fallback rather than the default. The `og-image.png` in the meta tags is only
fetched by crawlers and social platforms, so convert it too but keep the `.png`
extension or update the `og:image` content accordingly.

---

## Credits

- **GSAP + ScrollTrigger** — Webflow, free for standard use ([gsap.com](https://gsap.com))
- **Lenis** — Studio Freight ([lenis.darkroom.engineering](https://lenis.darkroom.engineering))
- **Formspree** — form backend, free tier ([formspree.io](https://formspree.io))
- **Space Grotesk** — Florian Karsten, SIL Open Font License
- **Inter** — Rasmus Andersson, SIL Open Font License

Project cover images and the portrait are original to this project.

---

## License

The code in this repository is yours to use, adapt and ship. The fonts are under
the SIL Open Font License, and GSAP and Lenis carry their own licences — check
those before redistributing them commercially.
