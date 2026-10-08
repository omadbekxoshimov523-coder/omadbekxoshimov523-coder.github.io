# Portfolio — Yo‘ldoshev Erkinjon

Single-page portfolio for a Software Engineering student. One `index.html` with
all CSS and JavaScript inline: no frameworks, no build step, no dependencies.

**Live:** https://omadbekxoshimov523-coder.github.io/erkinjon/

Published from the repository root by `.github/workflows/pages.yml` — every push
to `main` rebuilds and republishes it within ~20 seconds.

Open it through a local server:

```bash
py -m http.server 8000     # then open http://127.0.0.1:8000/erkinjon/
```

## Design

- Dark premium theme — near-black `#06070d`, white text, blue `#6ea8ff` /
  violet `#8b7bff` accents.
- Glassmorphism cards with a cursor-following spotlight and hover lift.
- Google Fonts: **Space Grotesk** (headings), **Inter** (body),
  **JetBrains Mono** (labels).
- Animations: scroll-reveal, animated skill bars, counters, timeline line that
  draws itself, scroll progress bar, mobile burger menu.
- Accessible: focus rings, semantic landmarks, `prefers-reduced-motion`
  support, ARIA-labelled progress bars. Responsive from 360px up.

## Placeholders to replace

Everything still unknown is either a square-bracket marker or an obvious
`your_…` value — search `index.html` for `[` and `your_` to find them all:

| What | Where |
| --- | --- |
| Telegram (real) | `https://t.me/ErkinjonYoldashev` — already correct |
| GitHub (real) | `https://github.com/erkinjon1127` — already correct |
| Instagram | Contact section → `instagram.com/your_username` |
| Email | Contact section → `your.email@example.com` |
| Profile photo | Already set → `assets/photo.jpg` (square-cropped from the uploaded image). Swap the file to change it |
| Project demo links | `PROJECTS` array → each `View Project` href (GitHub buttons already point to the profile) |
| University name | Education timeline + About card |
| Certificates, articles, contests | Achievements section (bracketed markers) |

## Form backend (optional)

The contact form validates client-side only. To actually receive messages,
point it at a service such as Formspree:

```html
<form action="https://formspree.io/f/XXXXXXX" method="POST">
```

then remove `novalidate` and the `submit` handler in the script.
