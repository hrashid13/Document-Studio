import { AVAILABLE_TREATMENTS, THEMES } from '../shared/types'

export function HelpModal({ onClose }: { onClose: () => void }) {
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
          <li><strong>New project</strong> — pick an empty folder; the studio keeps everything (text, media, settings) in there.</li>
          <li><strong>Import essay</strong> — a .txt, .md, or .docx file. Every paragraph becomes a card in the storyboard.</li>
          <li><strong>Add media</strong> — drop images/files onto the left panel, or paste a URL. Tag items ("before", "hero") to find them quickly.</li>
          <li><strong>Drag media into the essay</strong> — drag any image or file from the left panel and drop it <em>between</em> two paragraphs in the storyboard to insert it there.</li>
          <li><strong>Pick treatments</strong> — each card has a dropdown that controls how that paragraph behaves. Click a card to fine-tune it in the right-hand Inspector.</li>
          <li><strong>Preview</strong> — a live, scrollable render of the article, identical to what gets exported.</li>
          <li><strong>Export…</strong> — writes a folder with an index.html you can open anywhere or host on any static site.</li>
        </ol>

        <h3>Treatments (what each one does)</h3>
        <dl>
          {AVAILABLE_TREATMENTS.map((t) => (
            <div key={t.value} className="help-item">
              <dt>{t.label}</dt>
              <dd>{t.description}</dd>
            </div>
          ))}
        </dl>

        <h3>Themes</h3>
        <p className="help-note">
          The theme dropdown in the toolbar swaps the article's font pairing, accent color, and spacing — no CSS
          required. It applies to the preview and the export alike.
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
          <li>For sticky-scroll sections, write short punchy step texts — each step should earn one change in the visual.</li>
          <li>Chart steps take one <code>Label, value</code> per line. Reuse the same labels across steps to make bars morph instead of pop.</li>
          <li>Everything autosaves to <code>project.json</code> in your project folder.</li>
        </ul>
      </div>
    </div>
  )
}
