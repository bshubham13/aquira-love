import { motion } from 'motion/react'
import type { ProposalData } from '../lib/proposal'

interface MarqueeProps {
  data: ProposalData
  onEnter: () => void
}

/**
 * STAGE 0 — The Marquee.
 * A flickering neon diner sign in the rain. The recipient's name is already
 * on the "reserved" card in the window — the first hint this was set up for
 * them specifically. No instructions. Just a door to push.
 */
export function Marquee({ data, onEnter }: MarqueeProps) {
  return (
    <motion.div
      className="marquee"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
      transition={{ duration: 0.6 }}
    >
      <div className="sign-wrap">
        <div className="sign-flicker">
          <span className="sign-open">OPEN</span>
          <h1 className="sign-title">{data.diner}</h1>
          <span className="sign-sub">25 HOURS · NO REFUNDS · ONE REGRET</span>
        </div>
        <div className="sign-reflection" aria-hidden="true">
          {data.diner}
        </div>
      </div>

      <motion.div
        className="reserved-card"
        initial={{ opacity: 0, y: 20, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 120, damping: 14 }}
      >
        <span className="reserved-pin" />
        <p className="reserved-label">RESERVED</p>
        <p className="reserved-name">{data.to}</p>
        <p className="reserved-time">2:47 AM · table for two</p>
      </motion.div>

      <motion.button
        className="push-door"
        onClick={onEnter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="door-handle" aria-hidden="true" />
        Push the door
      </motion.button>

      <p className="marquee-hint">it's cold out. come in.</p>
    </motion.div>
  )
}