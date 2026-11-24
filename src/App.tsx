import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Atmosphere, Waiter } from './components/Atmosphere'
import { Creator } from './stages/Creator'
import { Marquee } from './stages/Marquee'
import { Seat } from './stages/Seat'
import { Menu } from './stages/Menu'
import { Jukebox } from './stages/Jukebox'
import { Catch } from './stages/Catch'
import { Hesitate } from './stages/Hesitate'
import { Finale } from './stages/Finale'
import { ShareMoment } from './stages/ShareMoment'
import {
  DEFAULT_PROPOSAL,
  readProposalFromHash,
  type ProposalData,
} from './lib/proposal'
import type { ReceiptLine } from './lib/receipt'

// The seven beats of the night. Dawn value is the sky's warmth at each beat.
type Beat =
  | 'creator'
  | 'marquee'
  | 'seat'
  | 'menu'
  | 'jukebox'
  | 'catch'
  | 'hesitate'
  | 'finale'
  | 'share'

const DAWN: Record<Beat, number> = {
  creator: 0.05,
  marquee: 0.08,
  seat: 0.2,
  menu: 0.35,
  jukebox: 0.5,
  catch: 0.68,
  hesitate: 0.82,
  finale: 0.95,
  share: 1,
}

const WAITER_LINES: Record<Beat, { msg: string; mood: 'idle' | 'happy' | 'smug' | 'love' }> = {
  creator: { msg: 'Welcome. I am A.Q. Unit-01. I do not sleep. You should not keep me waiting.', mood: 'idle' },
  marquee: { msg: 'Table for two. I already know. Please don’t ask how.', mood: 'smug' },
  seat: { msg: 'Careful with the stool. The last one who sat there is still here. Emotionally.', mood: 'idle' },
  menu: { msg: 'Everything is technically fresh. I defrosted it this morning.', mood: 'idle' },
  jukebox: { msg: 'I have one song loaded. I have had it loaded for a very long time.', mood: 'idle' },
  catch: { msg: 'The napkins are not napkins. I am not authorized to say more.', mood: 'smug' },
  hesitate: { msg: 'Ask them. I will handle the “no”. I have contingency protocols.', mood: 'smug' },
  finale: { msg: 'The bill is ready. It has been ready since before you arrived.', mood: 'love' },
  share: { msg: 'Order up. Give it to them. I will keep the light on.', mood: 'happy' },
}

export default function App() {
  const shared = useMemo(
    () => readProposalFromHash(window.location.hash),
    [],
  )

  const [beat, setBeat] = useState<Beat>(shared ? 'marquee' : 'creator')
  const [data, setData] = useState<ProposalData>(shared ?? { ...DEFAULT_PROPOSAL })
  const [lines, setLines] = useState<ReceiptLine[]>([])

  const addLine = useCallback((line: Omit<ReceiptLine, 'id'>) => {
    setLines((prev) => [...prev, { ...line, id: `${line.kind}-${prev.length}` }])
  }, [])

  // Keep the URL in sync once a creator launches, so refresh keeps their place.
  useEffect(() => {
    if (beat === 'creator') return
  }, [beat])

  const go = useCallback((next: Beat) => setBeat(next), [])

  // Seed receipt lines as the night progresses.
  useEffect(() => {
    if (beat === 'marquee') {
      addLine({ label: '1x reservation', amount: 'PRICELESS', kind: 'item' })
    }
    if (beat === 'jukebox') {
      addLine({ label: '1x song (yours)', amount: 'on the house', kind: 'item' })
    }
    if (beat === 'catch') {
      addLine({ label: '4x napkins (notes)', amount: 'no charge', kind: 'memo' })
    }
    if (beat === 'hesitate') {
      addLine({ label: '1x dignity (blue plate)', amount: '0.00', kind: 'gag' })
    }
  }, [beat, addLine])

  const waiter = WAITER_LINES[beat]

  // The creator beat renders without the diner atmosphere / waiter.
  if (beat === 'creator') {
    return (
      <div className="creator-shell">
        <AnimatePresence mode="wait">
          <Creator
            key="creator"
            onLaunch={(d) => {
              setData(d)
              go('marquee')
            }}
          />
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Atmosphere dawn={DAWN[beat]}>
      <Waiter message={waiter.msg} mood={waiter.mood} />

      <div className="beat-host">
        <AnimatePresence mode="wait">
          {beat === 'marquee' && (
            <Marquee key="marquee" data={data} onEnter={() => go('seat')} />
          )}
          {beat === 'seat' && (
            <Seat key="seat" data={data} onSeated={() => go('menu')} />
          )}
          {beat === 'menu' && (
            <Menu key="menu" data={data} onOrder={() => go('jukebox')} />
          )}
          {beat === 'jukebox' && (
            <Jukebox key="jukebox" data={data} onPlayed={() => go('catch')} />
          )}
          {beat === 'catch' && (
            <Catch key="catch" data={data} onCaught={() => go('hesitate')} />
          )}
          {beat === 'hesitate' && (
            <Hesitate key="hesitate" data={data} onYes={() => go('finale')} />
          )}
          {beat === 'finale' && (
            <Finale key="finale" data={data} lines={lines} onFinish={() => go('share')} />
          )}
          {beat === 'share' && (
            <ShareMoment
              key="share"
              data={data}
              onReplay={() => {
                setLines([])
                window.location.hash = ''
                go('marquee')
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <ReceiptTicker lines={lines} />
    </Atmosphere>
  )
}

/** A slim receipt that grows in the corner as the night goes on. */
function ReceiptTicker({ lines }: { lines: ReceiptLine[] }) {
  if (lines.length === 0) return null
  return (
    <div className="receipt-ticker" aria-hidden="true">
      {lines.slice(-4).map((l) => (
        <div key={l.id} className={`rt-line rt-${l.kind}`}>
          <span>{l.label}</span>
          <span>{l.amount}</span>
        </div>
      ))}
    </div>
  )
}