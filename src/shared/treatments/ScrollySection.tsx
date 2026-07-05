import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { findMedia, parseChartData } from '../types'
import type { MediaItem, ScrollyStep } from '../types'
import { useAssetResolver } from '../ArticleRenderer'
import { FocusParagraph } from '../TextContent'

function Step({
  index,
  text,
  active,
  focusText,
  onActive,
}: {
  index: number
  text: string
  active: boolean
  focusText: boolean
  onActive: (i: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  // A step becomes "current" when it crosses the middle band of the viewport.
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inView) onActive(index)
  }, [inView, index, onActive])
  const body = text || '(empty step — write its text in the Inspector)'
  return (
    <div ref={ref} className={`ia-scrolly-step${active ? ' active' : ''}`}>
      {focusText ? <FocusParagraph text={body} mark={false} /> : <p>{body}</p>}
    </div>
  )
}

export function ScrollyBarChart({ data, title }: { data: { label: string; value: number }[]; title?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="ia-chart">
      {title && <p className="ia-chart-title">{title}</p>}
      <AnimatePresence mode="popLayout" initial={false}>
        {data.map((d) => (
          <motion.div
            layout
            key={d.label}
            className="ia-chart-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="ia-chart-label">{d.label}</span>
            <div className="ia-chart-track">
              <motion.div
                className="ia-chart-bar"
                animate={{ width: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <span className="ia-chart-value">{d.value}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function ScrollySection({
  config,
  media,
  focusText = false,
}: {
  config: Record<string, unknown>
  media: MediaItem[]
  /** True when the block also has Sentence focus — step text highlights per line. */
  focusText?: boolean
}) {
  const resolve = useAssetResolver()
  const [active, setActive] = useState(0)

  const visualType = String(config.visualType ?? 'image')
  const side = String(config.position ?? 'left') === 'right' ? 'right' : 'left'
  const steps = (Array.isArray(config.steps) ? config.steps : []) as ScrollyStep[]

  if (steps.length === 0) {
    return <div className="ia-scrolly-placeholder">Sticky-scroll section: add steps in the Inspector.</div>
  }

  const current = steps[Math.min(active, steps.length - 1)]

  let visual = null
  if (visualType === 'chart') {
    const data = parseChartData(current.chartData)
    visual =
      data.length > 0 ? (
        <ScrollyBarChart data={data} title={String(config.chartTitle ?? '')} />
      ) : (
        <div className="ia-scrolly-placeholder">
          No chart data for this step. Enter one “Label, value” per line in the Inspector.
        </div>
      )
  } else {
    const item = findMedia(media, current.imageId)
    visual = item?.storedPath ? (
      <div className="ia-scrolly-media">
        <AnimatePresence initial={false}>
          <motion.img
            key={item.id}
            src={resolve(item.storedPath)}
            alt={item.originalFilename}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
        </AnimatePresence>
      </div>
    ) : (
      <div className="ia-scrolly-placeholder">Pick an image for this step in the Inspector.</div>
    )
  }

  return (
    <section className="ia-scrolly" data-side={side}>
      <div className="ia-scrolly-visual">
        <div className="ia-scrolly-sticky">{visual}</div>
      </div>
      <div className="ia-scrolly-steps">
        {steps.map((step, i) => (
          <Step
            key={step.id ?? i}
            index={i}
            text={step.text}
            active={i === active}
            focusText={focusText}
            onActive={setActive}
          />
        ))}
      </div>
    </section>
  )
}
