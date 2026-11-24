import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ProposalData } from '../lib/proposal'

interface CatchProps {
  data: ProposalData
  onCaught: () => void
}

const NOTES = [
  'i noticed you.',
  'i kept noticing.',
  'it became a problem.',
  'the good kind.',
]

/**
 * STAGE 4 — Catch.
 * A diner napkin dispenser keeps flicking out little paper notes. The recipient
 * taps/clicks to catch each one before it flutters away. Four notes, each a
 * step closer. Miss one and it just comes back — no fail state, only patience.
 * The notes are the pivot from playful to sincere.
 */
export function Catch({ data, onCaught }: CatchProps) {
  const [caught, setCaught] = useState<number[]>([])
  const [round, setRound] = useState(0) // increments to respawn a missed note
  const total = NOTES.length

  const catchNote = (i: number) => {
    if (caught.includes(i)) return
    const next = [...caught, i]
    setCaught(next)
    if (next.length === total) {
      window.setTimeout(onCaught, 2200)
    }
  }

  const currentIndex = caught.length

  return (
    <motion.div
      className="catch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
    >
      <p className="stage-kicker">the napkin dispenser</p>
      <h2 className="stage-title">It keeps giving you things.</h2>
      <p className="stage-sub">
        {currentIndex === 0
          ? 'Catch them. They’re for you.'
          : currentIndex < total
            ? `${caught.length} of ${total} — keep catching.`
            : 'that’s all of them.'}
      </p>

      <div className="dispenser-scene">
        <div className="dispenser">
          <div className="dispenser-slot" />
          <span className="dispenser-word">NAPKINS</span>
        </div>

        <AnimatePresence mode="popLayout">
          {currentIndex < total && (
            <motion.button
              key={`${currentIndex}-${round}`}
              className="flying-note"
              onClick={() => catchNote(currentIndex)}
              initial={{ y: -10, opacity: 0, rotate: -6, scale: 0.8 }}
              animate={{
                y: [0, 40, 120, 200],
                x: [0, 30, -20, 10],
                rotate: [-6, 8, -10, 4],
                opacity: [0, 1, 1, 0.85],
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 1.4, filter: 'blur(4px)' }}
              transition={{
                duration: 4.2,
                ease: 'linear',
                times: [0, 0.35, 0.75, 1],
              }}
              onAnimationComplete={() => {
                // If it finished falling without being caught, respawn.
                if (!caught.includes(currentIndex)) {
                  setRound((r) => r + 1)
                }
              }}
            >
              <span className="note-text">{NOTES[currentIndex]}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Collected notes stack */}
        <div className="caught-stack">
          {caught.map((i) => (
            <motion.div
              key={i}
              className="caught-note"
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: (i % 2 ? 1 : -1) * 3 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            >
              {NOTES[i]}
            </motion.div>
          ))}
        </div>
      </div>

      {currentIndex === total && (
        <motion.p
          className="catch-ack"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {data.to}, you were never supposed to catch all of these.
          <br />
          (i’m glad you did.)
        </motion.p>
      )}
    </motion.div>
  )
}