# jkcol.github.io

Personal portfolio — [jkcol.github.io](https://jkcol.github.io/)

Static site, no build step. Plain HTML/CSS/JS deployed straight from `main` by GitHub Pages.

| File | Purpose |
| --- | --- |
| `index.html` | All page content |
| `styles.css` | All styling, including light/dark themes |
| `script.js` | Theme toggle, hero wave animation, binary flicker, resume-viewer guard |
| `a-hole.js` | Black-hole canvas behind the Work section |
| `rays-background.js` | Ray background behind the About section |
| `assets/` | Project screenshots, headshot, resume PDF |

## Preview locally

```
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Adding the resume

Drop the PDF at `assets/jayden-kim-resume.pdf`. The Resume section picks it up
automatically — download button, open-in-new-tab, and an inline viewer on desktop.
If the file is missing, the inline viewer removes itself rather than showing a
broken embed.

## Adding a project

Copy an `<article class="work-card">` block in `index.html`. Each card needs a
title, a description, tech tags, and at least one link. Add `work-card-feature`
and a `<span class="work-badge">Live Demo</span>` for projects with a hosted
demo. For projects without a screenshot, use
`<div class="work-card-preview work-card-preview-blank"><span>…</span></div>`.
