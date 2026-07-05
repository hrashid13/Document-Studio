# Interactive Article Studio — Product Requirements Document

## 1. Summary

A downloadable desktop app (Electron) that lets a user import an essay along with images, files, and links, then build it into a Pudding-style interactive article using a library of pre-built interaction components (scroll reveals, drag comparisons, hover annotations, click-to-expand, etc.). No AI/LLM is used in the core product — layout suggestions come from a deterministic rules engine. The final piece exports as a self-contained, standalone web bundle the user can open locally or host anywhere.

## 2. Goals

- Let a non-technical user go from "essay + media" to a polished interactive article without writing code.
- Provide a fixed, reliable library of interaction component types — no unpredictable AI-generated layouts.
- Studio preview and final export use the exact same rendering engine (true WYSIWYG).
- Output is portable: a folder that runs standalone in any browser, no server or install required to view it.
- Optional: an auto-populate "rules engine" pass on import that assigns sensible default components to each block, which the user can then edit.

## 3. Non-Goals

- No LLM/AI-driven content generation or layout decisions in v1.
- No multi-user collaboration or cloud sync in v1.
- No custom/user-authored component types in v1 (component library is fixed, built by the developer).
- No mobile app.

## 4. Users

Primary user: someone with a finished essay (student, writer, hobbyist) who wants to present it as an interactive web piece instead of a plain document, without coding.

## 5. Core Concepts

**Project** — a single article-in-progress. Stored as a project folder containing a manifest (`project.json`) and an `/assets` folder for imported media.

**Block** — one segment of the essay (typically a paragraph or user-defined section break). Each block has raw text and is assigned exactly one "treatment" (a component type + its config).

**Treatment** — the component type wrapping a block, plus whatever config that component needs (e.g. `DragCompare` needs two image references; `HoverAnnotate` needs a trigger phrase and popover text).

**Storyboard** — the ordered list of blocks with their treatments. This is the thing the user edits in the studio and the thing that gets rendered on export.

## 6. Data Model

`project.json`:

```json
{
  "projectName": "string",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "media": [
    {
      "id": "media_0001",
      "type": "image | file | link",
      "originalFilename": "before.jpg",
      "storedPath": "assets/media_0001.jpg",
      "tags": ["before"],
      "metadata": { "width": 1200, "height": 800 }
    }
  ],
  "blocks": [
    {
      "id": "block_0001",
      "order": 0,
      "rawText": "string",
      "treatment": {
        "type": "plain | scroll-reveal | drag-compare | hover-annotate | click-expand | parallax-image | animated-stat | pull-quote | embedded-link",
        "config": {}
      }
    }
  ]
}
```

Each treatment type has its own `config` shape — defined in section 8.

## 7. App Structure (Studio UI)

Three-panel layout:

- **Left panel — Media library.** Drag-and-drop import for images, files, and links. Each item is taggable (free-text tags like "before", "hero", "diagram") to help the rules engine and to make items easier to find when assigning to blocks.
- **Center panel — Storyboard.** One card per block, vertically ordered (draggable to reorder). Each card shows: the block's raw text, a dropdown to pick its treatment type, and inline config controls appropriate to that treatment (e.g. two image-picker slots for drag-compare).
- **Right panel — Inspector.** Deeper settings for whichever block/treatment is currently selected (e.g. animation timing, color accents, alignment).
- **Toolbar.** Import essay, import media, run auto-populate (rules engine), toggle preview mode, export.
- **Preview mode.** Full-width live render of the current storyboard using the same components as the exported output. Should be scrollable and interactive, not a static thumbnail.

## 8. Component Library (v1 set)

Build these first, in this priority order:

1. **Plain** — default. Just renders the paragraph text with standard typography. No config.
2. **Scroll-reveal** — block fades/slides into view as the user scrolls to it. Config: `direction` (up/left/right), `delay`.
3. **Drag-compare** — before/after image slider with a draggable divider. Config: `imageA`, `imageB`, optional labels for each side.
4. **Hover-annotate** — a phrase in the text is underlined; hovering shows a popover with extra text, an image, or a link. Config: `triggerPhrase`, `popoverContent` (text/image/link), `popoverType`.
5. **Click-expand** — a collapsed summary line that expands to full content on click (accordion-style). Config: `summaryText`, `expandedContent`.
6. **Parallax-image** — full-width image that scrolls at a different speed than the text for a depth effect. Config: `image`, `speed`.
7. **Animated-stat** — a number in the text counts up/animates in when scrolled into view. Config: `value`, `prefix`, `suffix`, `duration`.
8. **Pull-quote** — short text pulled out and displayed in large/serif styling. Config: `quoteText`, `attribution` (optional).
9. **Embedded-link** — a linked URL rendered as a styled preview card (title, optional thumbnail) instead of plain hyperlink text. Config: `url`, `title`, `thumbnail` (optional, manually supplied since no auto-scraping in v1).

Each component must work identically in the studio preview iframe and in the final exported bundle — implement them once as a shared component set imported by both.

## 9. Import / Ingestion

- **Essay import:** accept `.docx`, `.md`, or `.txt`. Parse into blocks by splitting on paragraph breaks (blank lines / paragraph tags). Preserve original paragraph order and text exactly; no rewriting.
- **Media import:** accept common image formats (jpg/png/webp/gif), arbitrary files (pdf, etc. — treated as downloadable attachments), and pasted URLs (stored as link media items, no scraping in v1).
- All imported media gets copied into the project's `/assets` folder and referenced by `storedPath`, never by absolute filesystem path, so the project folder is portable.

## 10. Auto-Populate (Rules Engine, non-AI)

Runs once on import (or on demand) to pre-fill each block's treatment with a sensible default, which the user can then override. All rules are deterministic string/metadata checks — no model involved.

Example rules (tune during implementation):

- Paragraph over ~80 words with no associated media → `scroll-reveal`.
- Exactly two images tagged or filenamed with "before"/"after" (or "1"/"2") and no other media in that block → `drag-compare`.
- Short standalone line wrapped in quotation marks → `pull-quote`.
- Block containing a bare URL → `embedded-link`.
- Block containing a number followed by `%` or a unit-like word → `animated-stat`, with the detected number as `value`.
- Fallback for anything not matched → `plain`.

This should be implemented as a standalone, isolated module (e.g. `rulesEngine.ts`) that takes the parsed blocks + media list and returns a proposed storyboard, so rules can be added/tuned independently of the rest of the app.

## 11. Export

- Output: a self-contained folder (`/export`) containing static HTML/CSS/JS and a copied `/assets` folder. Opening `index.html` directly in a browser (or serving the folder from any static host) renders the full interactive article, no server or install required.
- The export step reuses the exact same render components as the studio preview — implement rendering as a shared module, invoked both inside the Electron renderer (for preview) and by the build/export step (for static output).
- "Download" in the UI = user picks a destination folder via the OS file dialog; app writes the export bundle there and reveals it in the file explorer.

## 12. Tech Stack

- **Shell:** Electron
- **Frontend:** React + Vite
- **Scroll/animation:** GSAP ScrollTrigger or Framer Motion (pick one, use consistently across all components)
- **Essay parsing:** mammoth.js (docx → structured text) or a markdown parser for `.md`
- **Drag/reorder in storyboard:** dnd-kit
- **Project storage:** flat folder with `project.json` + `/assets`, read/written via Electron's Node filesystem access (no database needed for v1)

## 13. MVP Scope (Phase 1)

Build in this order:

1. Electron + React + Vite scaffold, basic three-panel shell UI (no functionality yet).
2. Essay import + block parsing (plain text/markdown first, docx next).
3. Media import + media library panel.
4. Storyboard rendering with `plain` treatment only, reorderable.
5. Implement 3 components: `scroll-reveal`, `drag-compare`, `hover-annotate`. Wire each into both storyboard inspector controls and the shared render engine.
6. Preview mode using the shared render engine.
7. Export to static folder.
8. Once one full essay has been hand-built and exported successfully end-to-end: add remaining components (`click-expand`, `parallax-image`, `animated-stat`, `pull-quote`, `embedded-link`).
9. Add the rules-engine auto-populate pass last, once the component set is stable.

## 14. Open Questions / Decisions Needed During Build

- Section-break granularity: split blocks purely on paragraph breaks, or allow the user to manually merge/split blocks in the studio?
- Should exported bundles bundle their own copy of the render engine's JS (fully self-contained, larger file size) or fetch shared assets from a CDN (smaller, but requires internet to view)? Recommend fully self-contained for portability given the "download and present" use case.
- Whether to eventually offer "package as standalone Electron app per-project" as a stretch goal beyond the static-folder export.
