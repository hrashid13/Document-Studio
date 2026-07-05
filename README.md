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

1. **New project** — pick an empty folder; the app creates `project.json` + `assets/` there.
2. **Import essay** — `.txt`, `.md`, or `.docx`. Each paragraph becomes a storyboard block.
3. **Import media** — drag-drop or "Add files" in the left panel; paste URLs for link items. Tag items ("before", "after", …).
4. **Assign treatments** — per block, pick Plain / Scroll reveal / Drag compare / Hover annotate. Primary settings are on the card; everything else in the right-hand Inspector.
5. **Preview** — full-width live render using the exact same components as the export.
6. **Export…** — pick a destination; the app writes `<destination>/<project-name>/` with `index.html`, `viewer.js/css`, and copied `assets/`. Open `index.html` directly in a browser.

## Architecture notes

- `src/shared/` — the render engine (treatment components + `ArticleRenderer`). Used by BOTH the studio preview and the exported bundle, which is what guarantees WYSIWYG.
- `src/viewer/viewer.tsx` — entry for the export bundle; built as a single IIFE (`vite.viewer.config.ts` → `viewer-dist/`) so exports work from `file://`.
- `electron/main.cjs` — window, dialogs, media copying, `studio://` protocol (serves assets from the open project folder), export IPC.
- `electron/exporter.cjs` — writes the static bundle (inlines project JSON as `window.__ARTICLE_DATA__`).
- `src/studio/` — editor UI (toolbar, media library, storyboard, inspector, preview toggle).
- Projects are plain folders: `project.json` + `assets/`, portable by design.

## Not yet built (later phases)

Click-expand, parallax-image, animated-stat, pull-quote, embedded-link treatments, and the rules-engine auto-populate pass (PRD sections 8 & 10).
