import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import type { ProposalData } from '../lib/proposal'

interface JukeboxProps {
  data: ProposalData
  onPlayed: () => void
}

const LYRICS = [
  'you hum it wrong on purpose',
  'i let you',
  'every single time',
]

/**
 * STAGE 3 — The jukebox.
 * A little record player with one record. The recipient winds the crank
 * (circular drag) to spin it up. As it spins, three lines of "the song" surface
 * — the first genuinely tender beat, earned through effort. The song title is
 * the creator's, woven in as if it always existed here.
 */
export function Jukebox({ data, onPlayed }: JukeboxProps) {
  const crankRef = useRef<HTMLDivElement>(null)
  const [energy, setEnergy] = useState(0) // 0..1
  const [done, setDone] = useState(false)
  const dragging = useRef(false)
  const lastAngle = useRef(0)

  const rot = useMotionValue(0)
  const discRot = useTransform(rot, (r) => r * 0.5)
  const glow = useTransform(rot, (r) => Math.min(1, r / 900))

  const pointerAngle = (clientX: number, clientY: number) => {
    const el = crankRef.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI
  }

  const onDown = (e: React.PointerEvent) => {
    if (done) return
    dragging.current = true
    lastAngle.current = pointerAngle(e.clientX, e.clientY)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current || done) return
    const a = pointerAngle(e.clientX, e.clientY)
    let delta = a - lastAngle.current
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    lastAngle.current = a
    const next = rot.get() + delta
    rot.set(next)
    const e2 = Math.min(1, Math.abs(next) / 900)
    setEnergy(e2)
    if (e2 >= 1) finish()
  }

  const finish = () => {
    if (done) return
    setDone(true)
    dragging.current = false
    window.setTimeout(onPlayed, 3200)
  }

  const onUp = () => {
    dragging.current = false
  }

  // Keyboard / tap fallback: each tap adds a chunk of wind.
  const windTap = () => {
    if (done) return
    const next = rot.get() + 150
    rot.set(next)
    const e2 = Math.min(1, Math.abs(next) / 900)
    setEnergy(e2)
    if (e2 >= 1) finish()
  }

  const lyricVisible = (i: number) => energy > (i + 1) * 0.22

  return (
    <motion.div
      className="jukebox"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.5 }}
    >
      <p className="stage-kicker">the jukebox</p>
      <h2 className="stage-title">One record. Yours.</h2>

      <div className="record-scene">
        <motion.div
          className="record-disc"
          style={{ rotate: done ? undefined : discRot }}
          animate={done ? { rotate: 360 } : {}}
          transition={done ? { repeat: Infinity, duration: 2.2, ease: 'linear' } : {}}
        >
          <div className="record-grooves" />
          <div className="record-label">
            <span className="record-label-title">{data.song}</span>
            <span className="record-label-sub">SIDE A · 33⅓</span>
          </div>
          <div className="record-hole" />
        </motion.div>

        {/* Tonearm swings in when done */}
        <motion.div
          className="tonearm"
          animate={{ rotate: done ? 28 : -6 }}
          transition={{ type: 'spring', stiffness: 80, damping: 12 }}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="tonearm-pivot" />
          <div className="tonearm-bar" />
          <div className="tonearm-head" />
        </motion.div>

        <motion.div
          className="record-glow"
          style={{ opacity: glow }}
          aria-hidden="true"
        />
      </div>

      {/* Wind crank */}
      {!done && (
        <div className="crank-row">
          <motion.div
            ref={crankRef}
            className="crank"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClick={windTap}
            role="button"
            tabIndex={0}
            aria-label="Wind the jukebox crank"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                windTap()
              }
            }}
            style={{ touchAction: 'none' }}
          >
            <motion.div className="crank-arm" style={{ rotate: rot }}>
              <span className="crank-knob" />
            </motion.div>
            <span className="crank-hub" />
          </motion.div>
          <div className="wind-meter">
            <div className="wind-meter-fill" style={{ width: `${energy * 100}%` }} />
            <span className="wind-meter-label">
              {energy < 0.4
                ? 'wind it up'
                : energy < 0.8
                  ? 'keep going…'
                  : 'almost…'}
            </span>
          </div>
        </div>
      )}

      {/* Lyrics surface as it spins up */}
      <div className="lyrics">
        {LYRICS.map((line, i) => (
          <motion.p
            key={line}
            animate={{
              opacity: done || lyricVisible(i) ? 1 : 0,
              y: done || lyricVisible(i) ? 0 : 8,
              filter: done || lyricVisible(i) ? 'blur(0px)' : 'blur(4px)',
            }}
            transition={{ duration: 0.6, delay: done ? i * 0.5 : 0 }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      {done && (
        <motion.p
          className="jukebox-ack"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          …they don’t make songs like this anymore. they make them like you.
        </motion.p>
      )}
    </motion.div>
  )
}