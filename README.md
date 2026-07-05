# Interactive Article Studio

A desktop app (Electron + React) that turns an essay + images/files/links into a Pudding-style interactive web article — no code, no AI. The finished piece exports as a self-contained folder that opens in any browser.

Built from the PRD in [instructions v1.md](instructions%20v1.md). Current scope: MVP (PRD section 13, steps 1–7).

## Run it

```bash
npm install
npm run build:viewer   # builds the article renderer bundle used by Export
npm run dev            # starts Vite + Electron
```

> Re-run `npm run build:viewer` after changing anything in `src/shared/` — the export step copies that prebuilt bundle into every exported article.

## Build a Windows installer

```bash
npm run dist
```

This builds the studio + viewer bundles and produces `release/Interactive Article Studio Setup <version>.exe` (NSIS). Anyone can run that installer on Windows — no Node or other tooling required. The installer lets the user pick an install directory and creates a desktop shortcut.

Notes:
- The installer is unsigned, so Windows SmartScreen may show a "protected your PC" prompt — click "More info" → "Run anyway".
- `release/` is gitignored; distribute the setup exe via GitHub Releases rather than committing it.

## Workflow

1. **New project** — pick an empty folder; the app creates `project.json` + `assets/` there. Recently opened projects are listed on the start screen for one-click reopening.
2. **Import essay** — `.txt`, `.md`, or `.docx`. Each paragraph becomes a storyboard block.
3. **Import media** — drag-drop or "Add files" in the left panel; paste URLs for link items. Tag items ("before", "after", …).
4. **Drag media into the essay** — drag an image or file from the media library and drop it between two storyboard blocks to insert it there (images become figures, files become download cards).
5. **Style each block** — pick a *text style* (Plain / Heading / Sentence focus) and combine any number of *features*: Scroll reveal, Hover annotate, Inline link (linked phrase or button), Image figure, File attachment, Drag compare, Sticky scroll. Primary settings are on the card; everything else in the right-hand Inspector.
6. **Pick a theme** — the toolbar Theme dropdown swaps font pairing, accent color, and spacing (Classic / Modern / Editorial / Night). On top of the theme you can manually set a document-wide font (7 choices), accent color (10), font color (4), and background color (10) in the Inspector when no block is selected — or override font/font color per block.
7. **Preview** — full-width live render using the exact same components as the export.
8. **Export…** — pick a destination; the app writes `<destination>/<project-name>/` with `index.html`, `viewer.js/css`, and copied `assets/`. Open `index.html` directly in a browser.

In-app help: the **?** button in the toolbar explains every treatment and theme.

### Scrollytelling sections

The "Sticky scroll" treatment is the Pudding signature move: a visual stays pinned on one side while text steps scroll past on the other. The pinned visual is either an **image sequence** (each step crossfades to a different image) or a **bar chart** that morphs between steps — bars re-sort and re-size as the reader scrolls (chart data is one `Label, value` per line; reuse labels across steps so bars morph instead of popping). "Sentence focus" highlights the current sentence while dimming the rest as the reader scrolls.

## Architecture notes

- `src/shared/` — the render engine (treatment components + `ArticleRenderer`). Used by BOTH the studio preview and the exported bundle, which is what guarantees WYSIWYG.
- `src/viewer/viewer.tsx` — entry for the export bundle; built as a single IIFE (`vite.viewer.config.ts` → `viewer-dist/`) so exports work from `file://`.
- `electron/main.cjs` — window, dialogs, media copying, `studio://` protocol (serves assets from the open project folder), export IPC.
- `electron/exporter.cjs` — writes the static bundle (inlines project JSON as `window.__ARTICLE_DATA__`).
- `src/studio/` — editor UI (toolbar, media library, storyboard, inspector, preview toggle).
- Projects are plain folders: `project.json` + `assets/`, portable by design.

## Not yet built (later phases)

Click-expand, parallax-image, animated-stat, pull-quote, and embedded-link treatments, and the rules-engine auto-populate pass (PRD sections 8 & 10). Beyond the PRD, the app has since gained: image-figure and attachment blocks, drag-media-into-essay, themes, scrollytelling sections with morphing bar charts, and sentence-focus highlighting.
