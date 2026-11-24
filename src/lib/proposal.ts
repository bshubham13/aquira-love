// The entire proposal, encoded into a shareable URL hash.
// No backend: the creator's order pad serialises to `#d=<base64url>`.

export interface ProposalData {
  /** Creator (the one proposing). */
  from: string
  /** Recipient (the one being proposed to). */
  to: string
  /** The establishment name shown on the sign & receipt. */
  diner: string
  /** The private line revealed on the final course. */
  note: string
  /** The question, asked on the bill. */
  question: string
  /** Optional song title for the jukebox course. */
  song: string
}

export const DEFAULT_PROPOSAL: ProposalData = {
  from: 'Alex',
  to: 'Sam',
  diner: 'The Night Shift',
  note:
    "Of all the late nights, you're the one I'd keep the lights on for.",
  question: 'Will you be mine?',
  song: 'our song',
}

const HASH_PREFIX = '#d='

function toBase64Url(input: string): string {
  // encodeURIComponent → percent-safe bytes → base64 → url-safe.
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Coerce unknown parsed data into a valid ProposalData with safe fallbacks. */
function sanitize(raw: unknown): ProposalData {
  const base = { ...DEFAULT_PROPOSAL }
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Record<string, unknown>
  const str = (key: keyof ProposalData, max: number): void => {
    const v = r[key]
    if (typeof v === 'string' && v.trim()) {
      ;(base[key] as string) = v.trim().slice(0, max)
    }
  }
  str('from', 40)
  str('to', 40)
  str('diner', 48)
  str('note', 240)
  str('question', 80)
  str('song', 60)
  return base
}

export function encodeProposal(data: ProposalData): string {
  return HASH_PREFIX + toBase64Url(JSON.stringify(data))
}

export function readProposalFromHash(hash: string): ProposalData | null {
  if (!hash.startsWith(HASH_PREFIX)) return null
  try {
    const json = fromBase64Url(hash.slice(HASH_PREFIX.length))
    return sanitize(JSON.parse(json))
  } catch {
    return null
  }
}

export function buildShareUrl(data: ProposalData): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}${encodeProposal(data)}`
}