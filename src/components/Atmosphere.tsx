import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

interface AtmosphereProps {
  /** 0 → 1. Night (cold) to dawn (warm). Drives the sky behind the window. */
  dawn: number
  children: ReactNode
}

/**
 * The diner shell: a fixed night-to-dawn sky, film grain, vignette, and the
 * warm hanging-lamp glow. Everything sits inside this one world.
 */
export function Atmosphere({ dawn, children }: AtmosphereProps) {
  const reduced = useReducedMotion()
  const d = Math.max(0, Math.min(1, dawn))

  return (
    <div className="atmos" style={{ ['--dawn' as string]: d }}>
      <div className="sky" aria-hidden="true">
        <div className="sky-night" style={{ opacity: 1 - d }} />
        <div className="sky-dawn" style={{ opacity: d }} />
        <div className="stars" style={{ opacity: (1 - d) * 0.9 }}>
          {STARS.map((s, i) => (
            <span
              key={i}
              className="star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.s,
                height: s.s,
                animationDelay: `${s.d}s`,
              }}
            />
          ))}
        </div>
        {/* The window frame the whole night is seen through. */}
        <div className="window-frame" />
      </div>

      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="lamp-glow" aria-hidden="true" style={{ opacity: 0.55 + d * 0.35 }} />

      <main className="stage">{children}</main>

      {!reduced && <FloatingDust count={14} warm={d} />}
    </div>
  )
}

const STARS = Array.from({ length: 46 }, (_, i) => {
  // Deterministic pseudo-random so stars don't jump between renders.
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  return { x: r(1) * 100, y: r(2) * 70, s: 1 + r(3) * 1.8, d: r(4) * 4 }
})

function FloatingDust({ count, warm }: { count: number; warm: number }) {
  return (
    <div className="dust" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const r = (n: number) => ((Math.sin(i * 4.13 + n * 9.7) * 1000) % 1 + 1) % 1
        return (
          <motion.span
            key={i}
            className="mote"
            style={{
              left: `${r(1) * 100}%`,
              background: warm > 0.5 ? '#ffd89a' : '#9fb4c9',
            }}
            animate={{ y: ['0%', '-120%'], opacity: [0, 0.5, 0] }}
            transition={{
              duration: 9 + r(2) * 8,
              repeat: Infinity,
              delay: r(3) * 6,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}

interface WaiterProps {
  message: string
  mood?: 'idle' | 'happy' | 'smug' | 'love'
}

/** The deadpan robot waiter. Its face reacts to the current mood. */
export function Waiter({ message, mood = 'idle' }: WaiterProps) {
  return (
    <div className="waiter">
      <div className={`bot mood-${mood}`} aria-hidden="true">
        <div className="bot-antenna" />
        <div className="bot-head">
          <BotEyes mood={mood} />
          <div className="bot-mouth" />
        </div>
        <div className="bot-body">
          <span className="bot-bowtie" />
        </div>
      </div>
      <div className="waiter-bubble">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

function BotEyes({ mood }: { mood: WaiterProps['mood'] }) {
  if (mood === 'love') {
    return (
      <div className="bot-eyes">
        <span className="eye heart">♥</span>
        <span className="eye heart">♥</span>
      </div>
    )
  }
  if (mood === 'happy') {
    return (
      <div className="bot-eyes">
        <span className="eye arc" />
        <span className="eye arc" />
      </div>
    )
  }
  return (
    <div className="bot-eyes">
      <span className="eye" />
      <span className="eye" />
    </div>
  )
}