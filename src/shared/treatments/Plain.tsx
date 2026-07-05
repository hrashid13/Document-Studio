import type { TreatmentProps } from '../ArticleRenderer'

export function Plain({ block }: TreatmentProps) {
  return <p className="ia-paragraph">{block.rawText}</p>
}
