// src/experiments/ab.ts
// Cookie-less, stable A/B assignment (no UI flicker)

export type Variant = 'inline-change' | 'lean-save'
export type Assignment = { testId: string; variant: Variant; source: 'user' | 'device' | 'stored' }

const LS_KEY_PREFIX = 'ab:variant:'

// Simple hash function to make assignment stable
function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return h >>> 0
}

// Build a device-specific key (no cookies)
function deriveDeviceKey(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const parts = [
    navigator.userAgent,
    navigator.language,
    tz,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
  ]
  return parts.join('|')
}

/**
 * Assigns a user/device deterministically to a variant (inline-change or lean-save)
 * and stores the result in localStorage for persistence.
 */
export function assignVariant(
  testId: string,
  userId?: string,
  weights?: Partial<Record<Variant, number>>
): Assignment {
  const lsKey = LS_KEY_PREFIX + testId

  // ✅ 1. If we already assigned this test before, reuse that variant (stable & prevents flicker)
  const stored = localStorage.getItem(lsKey)
  if (stored === 'inline-change' || stored === 'lean-save') {
    return { testId, variant: stored as Variant, source: 'stored' }
  }

  // ✅ 2. Weight split (defaults to 50/50)
  const wInline = weights?.['inline-change'] ?? 0.5
  const wLean = weights?.['lean-save'] ?? 0.5
  const total = wInline + wLean || 1
  const cutoff = wInline / total

  // ✅ 3. Generate a stable key based on user or device info
  const key = userId ? `user:${userId}` : `device:${deriveDeviceKey()}`

  // ✅ 4. Deterministic random number from hash
  const rnd = (hashString(testId + '|' + key) % 10000) / 10000

  // ✅ 5. Assign variant based on hash and weights
  const variant: Variant = rnd < cutoff ? 'inline-change' : 'lean-save'

  // ✅ 6. Persist result to localStorage
  localStorage.setItem(lsKey, variant)
  return { testId, variant, source: userId ? 'user' : 'device' }
}

