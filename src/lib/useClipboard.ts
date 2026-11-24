import { useCallback, useRef, useState } from 'react'

/**
 * Copy with graceful fallback for browsers without the async clipboard API
 * (older mobile Safari, insecure contexts). Always resolves to a boolean.
 */
export function useClipboard(resetAfter = 2200) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let ok = false
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          ok = true
        } else {
          ok = legacyCopy(text)
        }
      } catch {
        ok = legacyCopy(text)
      }

      if (ok) {
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetAfter)
      }
      return ok
    },
    [resetAfter],
  )

  return { copied, copy }
}

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    ta.style.pointerEvents = 'none'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, ta.value.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}