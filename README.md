# Portfolio — Xoshimov Omadbek

A single-page portfolio for a Software Engineer. One `index.html` with all CSS
and JavaScript inline: no frameworks, no build step, no dependencies.

**Live:** https://omadbekxoshimov523-coder.github.io/

---

## Folder structure

```
.
├── index.html              # the entire site (HTML + CSS + JS inline)
├── assets/
│   └── me.jpeg             # portrait used by the canvas fallback
├── frames/                 # optional scroll-scrubbed frame sequence
│   └── README.md
├── .github/workflows/
│   └── pages.yml           # auto-deploys to GitHub Pages on every push
├── 404.html
├── robots.txt
├── sitemap.xml
└── .gitignore
```

## The signature effect

A fixed, full-screen `<canvas>` sits behind the page and plays the owner's
portrait frame by frame as you scroll. It picks its source automatically:

| Situation | What happens |
| --- | --- |
| `frames/frame_0001.jpg` exists | The 120-frame sequence is preloaded and scrubbed by scroll position |
| No frames, `assets/me.jpeg` exists | The single photo is animated through 4 simulated poses (front → right → left → close-up at 1.55× zoom) |
| Neither exists | The loader finishes anyway with a clear message; the page works without a portrait |

A gold percentage counter fills while loading, an 8-second safety timeout
guarantees it never sticks at 0%, and a dark gradient shade keeps the text
readable (vertical on mobile).

## Generate the frame sequence

Record or generate a short AI video: front → head turns right → head turns left
→ leans in and takes the glasses off. Then export one JPEG per frame:

```bash
ffmpeg -i video.mp4 -vf "fps=20,scale=1280:-1" -q:v 4 frames/frame_%04d.jpg
```

- `fps=20` → 20 frames/second, so a 6-second clip gives 120 frames.
- `scale=1280:-1` → 1280px wide, aspect ratio preserved.
- `-q:v 4` → good quality; use `2`–`6` to trade size for quality.

If your sequence is not exactly 120 frames, change `FRAME_COUNT` at the top of
the `<script>` block in `index.html`. `frames/README.md` has the same notes.

You can tune these two constants in the same block:

```js
const FRAME_COUNT = 120;          // number of frames to preload
const FRAME_PATH  = "frames/frame_%04d.jpg";
const PHOTO_PATH  = "assets/me.jpeg";
const PHOTO_FOCUS = { x: 0.5, y: 0.34 };   // crop anchor for a landscape photo
```

`PHOTO_FOCUS` decides which part of the photo stays centred when it is
cover-fitted to the canvas. Raise `y` if the face sits low in the frame.

## Preview locally

Because the site loads `frames/` and `assets/` with relative paths, open it
through a local server rather than double-clicking the file:

```bash
py -m http.server 8000     # then open http://127.0.0.1:8000/
```

## Deploy to GitHub Pages

The site is published from the repository root by `.github/workflows/pages.yml`.

**First time:**

```bash
git init
git branch -M main
git add .
git commit -m "Portfolio v1"
gh repo create omadbekxoshimov523-coder.github.io --public --source=. --remote=origin --push
gh api -X POST repos/omadbekxoshimov523-coder/omadbekxoshimov523-coder.github.io/pages -f build_type=workflow
gh run watch
```

**Every later update:**

```bash
git add . && git commit -m "update" && git push
```

The workflow then rebuilds and republishes automatically (usually within a
minute or two). Check the run at
https://github.com/omadbekxoshimov523-coder/omadbekxoshimov523-coder.github.io/actions

## Fill in these placeholders

Anything still unknown is written in square brackets — search `index.html` for
`[` to find them all:

- Project screenshot paths, e.g. `[assets/projects/tez-elon.jpg]`
- Project descriptions and key features
- `[GITHUB URL]` and `[DEMO OR APK URL]` per project
- The two placeholder projects marked `[PROJECT NAME]`

The Telegram links are already live: `ElonTez_bot`, `Avto_Platforma_bot`,
`Smart_Vision1_bot`, `FARGONA_BESHAR1Q_bot`.

## Notes

- Colours: background `#05070d`, sky `#8fb4d9`, gold `#d9b46a`, cream `#f3efe6`.
- Fonts: **Syne** 600/800 for headings, **Manrope** 400/500/700 for body, from
  Google Fonts.
- Accessibility: gold focus outlines, `prefers-reduced-motion` support,
  semantic landmarks, and a decorative canvas that is hidden from screen
  readers. Responsive down to 360px.