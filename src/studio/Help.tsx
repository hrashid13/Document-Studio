import { AVAILABLE_TREATMENTS, THEMES } from '../shared/types'

export function HelpModal({ onClose }: { onClose: () => void }) {
  const textModes = AVAILABLE_TREATMENTS.filter((t) => t.category === 'text')
  const addons = AVAILABLE_TREATMENTS.filter((t) => t.category === 'addon')

  return (
    <div className="help-backdrop" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-head">
          <h2>How to use the studio</h2>
          <button className="btn subtle" onClick={onClose} title="Close help">
            ✕
          </button>
        </div>

        <h3>Quick start</h3>
        <ol>
          <li><strong>New project</strong> — pick an empty folder; the studio keeps everything (text, media, settings) in there. Recent projects appear on the start screen so you can jump back in.</li>
          <li><strong>Import essay</strong> — a .txt, .md, or .docx file. Every paragraph becomes a card in the storyboard.</li>
          <li><strong>Add media</strong> — drop images/files onto the left panel, or paste a URL. Tag items ("before", "hero") to find them quickly.</li>
          <li><strong>Drag media into the essay</strong> — drag any image or file from the left panel and drop it <em>between</em> two paragraphs in the storyboard to insert it there.</li>
          <li><strong>Style each block</strong> — pick a <em>text style</em> (Plain / Heading / Sentence focus) and add any number of <em>features</em> with the "+ Add feature…" dropdown. Click a card to fine-tune everything in the right-hand Inspector.</li>
          <li><strong>Preview</strong> — a live, scrollable render of the article, identical to what gets exported.</li>
          <li><strong>Export…</strong> — writes a folder with an index.html you can open anywhere or host on any static site.</li>
        </ol>

        <h3>Text styles (pick one per block)</h3>
        <dl>
          {textModes.map((t) => (
            <div key={t.value} className="help-item">
              <dt>{t.label}</dt>
              <dd>{t.description}</dd>
            </div>
          ))}
        </dl>

        <h3>Features (combine as many as you like)</h3>
        <dl>
          {addons.map((t) => (
            <div key={t.value} className="help-item">
              <dt>{t.label}</dt>
              <dd>{t.description}</dd>
            </div>
          ))}
        </dl>

        <h3>Themes & custom styles</h3>
        <p className="help-note">
          The toolbar Theme dropdown swaps the article's font pairing, accent color, and spacing. On top of that you
          can set a manual font, accent color, font color, and background color for the <strong>whole document</strong>{' '}
          (Inspector, with no block selected) or override the font and font color of a <strong>single block</strong>{' '}
          (Inspector, block selected). Pick ∅ to return to the theme default.
        </p>
        <dl>
          {THEMES.map((t) => (
            <div key={t.id} className="help-item">
              <dt>{t.label}</dt>
              <dd>{t.description}</dd>
            </div>
          ))}
        </dl>

        <h3>Tips</h3>
        <ul>
          <li>Drag the ⠿ handle on a card to reorder blocks.</li>
          <li>Double-click a block's text in the storyboard (or use the Text box in the Inspector) to edit it.</li>
          <li>Add a blank block anywhere: hover between two cards and click "+ add a blank block here", or use the "+ Add block" button at the bottom. Then type into it, make it a Heading, or attach a file or image.</li>
          <li>Align any block left, center, or right in the Inspector's Block style section — handy for centered section headers.</li>
          <li>Combine features: e.g. a Heading with Scroll reveal, or Sentence focus + Sticky scroll (step text highlights line by line).</li>
          <li>Inline links: link a phrase in the text, or show a button below the block instead.</li>
          <li>Chart steps take one <code>Label, value</code> per line. Reuse the same labels across steps so bars morph instead of popping.</li>
          <li>Everything autosaves to <code>project.json</code> in your project folder.</li>
        </ul>
      </div>
    </div>
  )
}
