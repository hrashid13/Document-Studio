import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const OFFSETS: Record<string, { x?: number; y?: number }> = {
  up: { y: 48 },
  left: { x: -64 },
  right: { x: 64 },
}

/** Wraps any block content so it fades/slides in when scrolled into view. */
export function Reveal({ config, children }: { config: Record<string, unknown>; children: ReactNode }) {
  const direction = String(config.direction ?? 'up')
  const delay = Number(config.delay ?? 0) || 0
  const offset = OFFSETS[direction] ?? OFFSETS.up

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
