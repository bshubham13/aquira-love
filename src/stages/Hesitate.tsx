import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ProposalData } from '../lib/proposal'

interface HesitateProps {
  data: ProposalData
  onYes: () => void
}

/**
 * STAGE 5 — The dodge.
 * The first, playful proposal. A big YES and a small "no". The "no" runs away
 * from the cursor/finger (comic), and after enough dodges it gives up and
 * shrinks into a tiny, exhausted "no". This is the laugh before the real ask.
 */
export function Hesitate({ data, onYes }: HesitateProps) {
  const [dodges, setDodges] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [cornered, setCornered] = useState(false)

  const dodge = () => {
    if (cornered) return
    const max = 160
    const nx = (Math.random() * 2 - 1) * max
    const ny = (Math.random() * 2 - 1) * (max * 0.6)
    setPos({ x: nx, y: ny })
    const d = dodges + 1
    setDodges(d)
    if (d >= 5) {
      window.setTimeout(() => setCornered(true), 350)
    }
  }

  const noLabel =
    dodges < 2 ? 'no' : dodges < 4 ? 'no, wait' : cornered ? 'no…' : 'no!'

  return (
    <motion.div
      className="hesitate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
      transition={{ duration: 0.6 }}
    >
      <p className="stage-kicker">the question, attempt one</p>
      <h2 className="stage-title">Okay. Here goes.</h2>

      <div className="ask-row">
        <motion.button
          className="yes-big"
          onClick={onYes}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ scale: { repeat: Infinity, duration: 2.2 } }}
        >
          yes
        </motion.button>

        <motion.button
          className={`no-run ${cornered ? 'cornered' : ''}`}
          onMouseEnter={dodge}
          onFocus={dodge}
          onClick={dodge}
          animate={{
            x: cornered ? 0 : pos.x,
            y: cornered ? 0 : pos.y,
            scale: cornered ? 0.6 : 1,
            rotate: cornered ? -8 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          style={{ position: 'absolute' }}
        >
          {noLabel}
        </motion.button>
      </div>

      <AnimatePresence>
        {cornered && (
          <motion.p
            className="no-gives-up"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.to}, even the “no” is tired. it’s been a long night.
          </motion.p>
        )}
        {!cornered && dodges >= 3 && (
          <motion.p
            className="no-taunt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            (it’s getting away from you)
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}