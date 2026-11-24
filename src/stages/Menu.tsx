import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ProposalData } from '../lib/proposal'

interface MenuProps {
  data: ProposalData
  onOrder: () => void
}

type Choice = 'sweet' | 'weird' | null

/**
 * STAGE 2 — The menu.
 * A diner menu where every item is a tiny joke. Picking anything makes the
 * waiter appear with a dry remark. There is no wrong order — but the diner
 * remembers which one you teased with. This seeds the running gag.
 */
export function Menu({ data, onOrder }: MenuProps) {
  const [choice, setChoice] = useState<Choice>(null)
  const [hover, setHover] = useState<string | null>(null)

  const items: { id: string; name: string; desc: string; price: string; key: Choice }[] = [
    {
      id: 'pie',
      name: 'Slice of warm pie',
      desc: 'Tastes like a memory you can’t quite place.',
      price: '1 smile',
      key: 'sweet',
    },
    {
      id: 'coffee',
      name: 'Bottomless coffee',
      desc: 'Refilled by a robot with no concept of limits.',
      price: 'free*',
      key: 'sweet',
    },
    {
      id: 'weird',
      name: 'The Blue Plate Special',
      desc: 'Nobody has ever finished it. Nobody has tried.',
      price: 'your dignity',
      key: 'weird',
    },
  ]

  const pick = (key: Choice) => {
    if (choice) return
    setChoice(key)
    window.setTimeout(onOrder, 2600)
  }

  return (
    <motion.div
      className="menu"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
    >
      <p className="stage-kicker">the menu</p>
      <h2 className="stage-title">What’ll it be?</h2>

      <div className="menu-card">
        <div className="menu-card-head">
          <span>TONIGHT’S SPECIALS</span>
          <span className="menu-asterisk">*prices negotiable under emotional duress</span>
        </div>
        {items.map((it, i) => (
          <motion.button
            key={it.id}
            className={`menu-item ${choice === it.key ? 'picked' : ''} ${
              choice && choice !== it.key ? 'dim' : ''
            }`}
            onHoverStart={() => setHover(it.id)}
            onHoverEnd={() => setHover(null)}
            onClick={() => pick(it.key)}
            disabled={!!choice}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * i + 0.2 }}
          >
            <span className="menu-item-name">{it.name}</span>
            <span className="menu-item-dots" aria-hidden="true">
              {hover === it.id ? '→' : '········'}
            </span>
            <span className="menu-item-price">{it.price}</span>
            <span className="menu-item-desc">{it.desc}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {choice && (
          <motion.div
            className="waiter-quip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="quip-tag">A.Q. UNIT-01</span>
            <p>
              {choice === 'weird'
                ? `“The Blue Plate. Bold. ${data.to} will be so proud. Or concerned.”`
                : `“Excellent choice. I have been programmed with 4,000 responses and I chose this one for you.”`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}