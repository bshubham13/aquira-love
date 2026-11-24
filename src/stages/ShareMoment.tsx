import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ProposalData } from '../lib/proposal'
import { buildShareUrl } from '../lib/proposal'
import { useClipboard } from '../lib/useClipboard'

interface ShareMomentProps {
  data: ProposalData
  onReplay: () => void
}

/**
 * STAGE 7 — The share moment (creator-facing).
 * After the recipient says yes, the creator lands here: a polished, reliable
 * copy-link flow with a bespoke "stamped PAID" reaction — not a toast. The
 * link round-trips all personalization through the URL hash.
 */
export function ShareMoment({ data, onReplay }: ShareMomentProps) {
  const url = buildShareUrl(data)
  const { copied, copy } = useClipboard()
  const [stamped, setStamped] = useState(false)
  const [shareable, setShareable] = useState(false)

  const doCopy = async () => {
    const ok = await copy(url)
    if (ok) {
      setStamped(true)
      window.setTimeout(() => setStamped(false), 2600)
    }
  }

  const nativeShare = async () => {
    if (!navigator.share) return
    try {
      await navigator.share({
        title: `${data.diner} — a table for two`,
        text: `${data.from} saved you a seat.`,
        url,
      })
    } catch {
      /* user dismissed — fine */
    }
  }

  // Feature-detect once on mount.
  useEffect(() => {
    setShareable(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  return (
    <motion.div
      className="share-moment"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <p className="stage-kicker">the night is yours to give</p>
      <h2 className="stage-title">Send them the diner.</h2>
      <p className="stage-sub">
        This link <em>is</em> the whole experience — their names, the song, the
        note. Nothing to set up on their end.
      </p>

      <div className="share-card">
        <div className="share-preview">
          <span className="sp-sign">{data.diner}</span>
          <span className="sp-reserved">RESERVED · {data.to}</span>
          <span className="sp-time">2:47 AM · table for two</span>
        </div>

        <div className="share-url">
          <input
            className="share-url-input"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Shareable proposal link"
          />
        </div>

        <div className="share-actions">
          <motion.button
            className={`copy-btn ${copied ? 'is-copied' : ''}`}
            onClick={doCopy}
            whileTap={{ scale: 0.96 }}
          >
            {copied ? 'Link copied ✓' : 'Copy the link'}
          </motion.button>
          {shareable && (
            <button className="native-share-btn" onClick={nativeShare}>
              Share…
            </button>
          )}
        </div>
      </div>

      {/* Bespoke "PAID" stamp reaction — the diner's approval, not a toast. */}
      <div className="stamp-layer" aria-hidden="true">
        <AnimatePresence>
          {stamped && (
            <motion.div
              className="paid-stamp"
              initial={{ scale: 2.4, opacity: 0, rotate: -22 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
            >
              <span className="paid-word">PAID</span>
              <span className="paid-sub">IN FULL · WITH LOVE</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {stamped && <StampBurst key="burst" />}
        </AnimatePresence>
      </div>

      <motion.p
        className="share-foot"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {copied
          ? 'Copied. Go make someone’s whole night.'
          : 'When they open it, the diner is already expecting them.'}
      </motion.p>

      <button className="replay-link" onClick={onReplay}>
        ↺ experience it again from the top
      </button>
    </motion.div>
  )
}

function StampBurst() {
  return (
    <div className="stamp-burst">
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2
        const r = (n: number) => ((Math.sin(i * 5.1 + n) * 100) % 1 + 1) % 1
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(a) * (60 + r(1) * 40),
              y: Math.sin(a) * (60 + r(1) * 40),
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}