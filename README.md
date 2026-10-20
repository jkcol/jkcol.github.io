# jkcol.github.io

Personal site — [jkcol.github.io](https://jkcol.github.io/)

Static, no build step, no dependencies. Plain HTML/CSS/JS deployed from `main`
by GitHub Pages.

| File | Purpose |
| --- | --- |
| `index.html` | All page content |
| `styles.css` | All styling |
| `script.js` | The hero wave animation (`<a-waves>`), the only JS on the page |
| `assets/` | Headshot, resume PDF, and project screenshots (currently unused) |

Typeface is the system sans stack, so the page loads no web fonts.

## Preview locally

```
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Editing

**Projects** live in the `<ul class="index">` list in `index.html` — one `<li>`
each: a link, an em dash, and one sentence. Two projects get an expanded
`<h3>` section below the list; keep that to the work most worth reading about.

**Experience** is a `<div class="role">` per job: an `<h3>` with the company, a
`<span>` with role and dates, then a short `<ul>`.

**Resume** is `assets/jayden-kim-resume.pdf`, linked from the header and the
contact section. Replace the file to update it; no markup changes needed.
