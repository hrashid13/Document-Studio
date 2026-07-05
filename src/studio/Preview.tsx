import { ArticleRenderer } from '../shared/ArticleRenderer'
import { resolveStudioAsset, useStudio } from './state'

/**
 * Full-width live preview. Renders the exact same shared components as the
 * exported bundle — this is the WYSIWYG guarantee.
 */
export function Preview() {
  const { state } = useStudio()
  if (!state.project) return null

  return (
    <div className="preview-scroll">
      <ArticleRenderer project={state.project} resolveAsset={resolveStudioAsset} />
    </div>
  )
}
