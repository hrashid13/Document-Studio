import { motion } from 'framer-motion'
import type { TreatmentProps } from '../ArticleRenderer'

const OFFSETS: Record<string, { x?: number; y?: number }> = {
  up: { y: 48 },
  left: { x: -64 },
  right: { x: 64 },
}

export function ScrollReveal({ block }: TreatmentProps) {
  const direction = String(block.treatment.config.direction ?? 'up')
  const delay = Number(block.treatment.config.delay ?? 0) || 0
  const offset = OFFSETS[direction] ?? OFFSETS.up

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      <p className="ia-paragraph">{block.rawText}</p>
    </motion.div>
  )
}
