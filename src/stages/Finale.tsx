import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ProposalData } from '../lib/proposal'
import type { ReceiptLine } from '../lib/receipt'
import { receiptFooter, receiptHeader } from '../lib/receipt'

interface FinaleProps {
  data: ProposalData
  lines: ReceiptLine[]
  onFinish: () => void
}

/**
 * STAGE 6 — The bill (the real one).
 * Dawn. The playful "no" is gone. The receipt the whole night has been printing
 * is laid out — and the total line is the creator's private note. The real
 * question sits at the bottom. Saying yes triggers the diner's reaction and
 * hands off to the share moment.
 */
export function Finale({ data, lines, onFinish }: FinaleProps) {
  const [saidYes, setSaidYes] = useState(false)

  const yes = () => {
    if (saidYes) return
    setSaidYes(true)
    window.setTimeout(onFinish, 4200)
  }

  return (
    <motion.div
      className="finale"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <p className="stage-kicker dawn-kicker">6:03 AM · the sky is doing something</p>

      <AnimatePresence>
        {!saidYes ? (
          <motion.div
            key="bill"
            className="bill-wrap"
            exit={{ opacity: 0, y: -40, rotate: -3 }}
          >
            <motion.div
              className="bill"
              initial={{ y: 60, opacity: 0, rotate: 2 }}
              animate={{ y: 0, opacity: 1, rotate: -1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 14 }}
            >
              <pre className="bill-text">
                {receiptHeader(data).join('\n')}
                {'\n'}
                {lines.map((l) => `${l.label.padEnd(24, ' ')}${l.amount}`).join('\n')}
                {'\n'}
                {'--------------------------------\n'}
                {'TOTAL'.padEnd(24, ' ') + 'one whole life, please\n'}
                {receiptFooter(data).join('\n')}
              </pre>
              <div className="bill-jagged" aria-hidden="true" />
            </motion.div>

            <motion.div
              className="real-question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <p className="rq-note">{data.note}</p>
              <h2 className="rq-ask">{data.question}</h2>
              <div className="rq-actions">
                <motion.button
                  className="rq-yes"
                  onClick={yes}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  animate={{ boxShadow: ['0 0 0px #ffd89a', '0 0 26px #ffd89a', '0 0 0px #ffd89a'] }}
                  transition={{ boxShadow: { repeat: Infinity, duration: 2.6 } }}
                >
                  Yes — a thousand times
                </motion.button>
                <span className="rq-from">— {data.from}</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <YesReaction key="reaction" data={data} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function YesReaction({ data }: { data: ProposalData }) {
  return (
    <motion.div
      className="yes-reaction"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="sunburst" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.span
            key={i}
            style={{ rotate: `${i * 15}deg` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.9 }}
            transition={{ delay: i * 0.02, type: 'spring', stiffness: 120, damping: 10 }}
          />
        ))}
      </div>
      <motion.h1
        className="reaction-title"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 12 }}
      >
        {data.to} said yes.
      </motion.h1>
      <motion.div
        className="confetti"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {Array.from({ length: 40 }).map((_, i) => {
          const r = (n: number) => ((Math.sin(i * 7.13 + n * 3.7) * 1000) % 1 + 1) % 1
          return (
            <motion.span
              key={i}
              style={{
                left: `${r(1) * 100}%`,
                background: ['#ffd89a', '#ff9d7a', '#9fb4c9', '#fff'][i % 4],
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ y: '110vh', rotate: r(2) * 720, opacity: [1, 1, 0.6] }}
              transition={{ duration: 3 + r(3) * 2, delay: r(4) * 1.5, ease: 'easeIn' }}
            />
          )
        })}
      </motion.div>
      <motion.p
        className="reaction-sub"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        table for two. forever, now. — with love, {data.from}
      </motion.p>
    </motion.div>
  )
}