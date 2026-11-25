import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { ProposalData } from '../lib/proposal'

interface SeatProps {
  data: ProposalData
  onSeated: () => void
}

/**
 * STAGE 1 — Take a seat.
 * Drag the stool up to the counter. Letting go near the counter "seats" you.
 * Works with mouse and touch.
 */
export function Seat({ data, onSeated }: SeatProps) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const stoolRef = useRef<HTMLDivElement>(null)
  const [seated, setSeated] = useState(false)
  const [nudge, setNudge] = useState(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 22 })
  const sy = useSpring(y, { stiffness: 260, damping: 22 })
  const tilt = useTransform(sx, [-160, 160], [-14, 14])

  const onDragEnd = () => {
    const zone = zoneRef.current?.getBoundingClientRect()
    const stool = stoolRef.current?.getBoundingClientRect()
    if (!zone || !stool) return

    const cx = stool.left + stool.width / 2
    const cy = stool.top + stool.height / 2

    // Forgiving hit area around the drop zone.
    const inside =
      cx > zone.left - 60 &&
      cx < zone.right + 60 &&
      cy > zone.top - 60 &&
      cy < zone.bottom + 60

    if (inside) {
      setSeated(true)
      x.set(0)
      y.set(0)
      window.setTimeout(onSeated, 1400)
    } else {
      x.set(0)
      y.set(0)
      setNudge((n) => n + 1)
    }
  }

  return (
    <motion.div
      className="seat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <p className="stage-kicker">the counter</p>
      <h2 className="stage-title">
        {seated ? `Evening, ${data.to}.` : 'Grab a seat.'}
      </h2>
      <p className="stage-sub">
        {seated
          ? "The stool's still warm. Someone was just here."
          : 'Drag the stool up to the counter. Take your time.'}
      </p>

      <div className="counter-scene">
        <div className="counter-top" />
        <div className="counter-front" />

        <motion.div
          ref={stoolRef}
          className={`stool ${seated ? 'is-seated' : ''}`}
          drag={!seated}
          dragConstraints={{
            left: -260,
            right: 260,
            top: -160,
            bottom: 220,
          }}
          dragElastic={0.25}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          style={{ x: sx, y: sy, rotate: tilt, touchAction: 'none' }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
          animate={
            seated
              ? { y: [-2, 0, -2], transition: { repeat: Infinity, duration: 2.4 } }
              : nudge
                ? { rotate: [0, -3, 3, 0] }
                : {}
          }
          key={`stool-${nudge}`}
        >
          <div className="stool-seat" />
          <div className="stool-legs" />
        </motion.div>

        {/* Drop target at the counter surface */}
        {!seated && (
          <motion.div
            ref={zoneRef}
            className="drop-zone"
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span>seat here</span>
          </motion.div>
        )}
      </div>

      {seated && (
        <motion.p
          className="seat-ack"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          table for two. how did I know?
        </motion.p>
      )}
    </motion.div>
  )
}