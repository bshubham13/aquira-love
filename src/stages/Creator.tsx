import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ProposalData } from '../lib/proposal'
import { DEFAULT_PROPOSAL, buildShareUrl } from '../lib/proposal'
import { useClipboard } from '../lib/useClipboard'

interface CreatorProps {
  onLaunch: (data: ProposalData) => void
}

/**
 * The creator's order pad. The sender fills a diner order ticket — not a form.
 * Warm, hand-written feel. A live preview of the sign sits alongside. On
 * "open the diner", it hands the data to the recipient experience AND reveals a
 * copy-link so the creator can share instead of playing it themselves.
 */
export function Creator({ onLaunch }: CreatorProps) {
  const [data, setData] = useState<ProposalData>({ ...DEFAULT_PROPOSAL })
  const [showShare, setShowShare] = useState(false)
  const { copied, copy } = useClipboard()

  const set = (k: keyof ProposalData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }))

  const launch = () => {
    onLaunch(data)
  }

  const url = buildShareUrl(data)

  return (
    <motion.div
      className="creator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="creator-head">
        <span className="creator-brand">AQUiRACRAFT</span>
        <span className="creator-tag">night shift · order pad</span>
      </header>

      <div className="creator-grid">
        {/* The ticket */}
        <motion.div
          className="ticket"
          initial={{ y: 30, opacity: 0, rotate: -1 }}
          animate={{ y: 0, opacity: 1, rotate: -0.6 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <div className="ticket-top">
            <span>ORDER</span>
            <span>#0247</span>
          </div>
          <p className="ticket-hint">
            Fill the ticket. We’ll set the table. Takes a minute.
          </p>

          <Field label="Your name (the one proposing)" value={data.from} onChange={set('from')} max={40} placeholder="Alex" />
          <Field label="Their name (the one you’re asking)" value={data.to} onChange={set('to')} max={40} placeholder="Sam" />
          <Field label="Name on the diner sign" value={data.diner} onChange={set('diner')} max={48} placeholder="The Night Shift" />
          <Field label="The song on the jukebox" value={data.song} onChange={set('song')} max={60} placeholder="our song" />
          <Field label="The question, on the bill" value={data.question} onChange={set('question')} max={80} placeholder="Will you be mine?" />
          <div className="field">
            <label className="field-label">The private line (revealed at dawn)</label>
            <textarea
              className="field-input field-area"
              value={data.note}
              onChange={set('note')}
              maxLength={240}
              rows={3}
              placeholder="Of all the late nights, you're the one I'd keep the lights on for."
            />
          </div>

          <motion.button
            className="open-diner-btn"
            onClick={launch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Open the diner →
          </motion.button>
          <p className="ticket-foot">free · no account · no data leaves this page</p>
        </motion.div>

        {/* Live preview */}
        <div className="creator-preview">
          <p className="preview-label">LIVE PREVIEW</p>
          <div className="preview-sign">
            <span className="preview-open">OPEN</span>
            <span className="preview-title">{data.diner || 'The Night Shift'}</span>
            <span className="preview-reserved">RESERVED · {data.to || 'someone'}</span>
          </div>

          <AnimatePresence>
            {showShare && (
              <motion.div
                className="creator-share"
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="creator-share-title">Or just send the link:</p>
                <div className="creator-share-row">
                  <input
                    className="share-url-input"
                    readOnly
                    value={url}
                    onFocus={(e) => e.currentTarget.select()}
                    aria-label="Shareable proposal link"
                  />
                  <button className="copy-btn small" onClick={() => copy(url)}>
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showShare && (
            <button className="preview-share-toggle" onClick={() => setShowShare(true)}>
              want a link instead? get the shareable URL →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function Field({
  label,
  value,
  onChange,
  max,
  placeholder,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  max: number
  placeholder?: string
}) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        value={value}
        onChange={onChange}
        maxLength={max}
        placeholder={placeholder}
      />
    </div>
  )
}