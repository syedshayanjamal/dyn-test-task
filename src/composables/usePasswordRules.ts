// src/composables/usePasswordRules.ts

// Password validation rules used in the password change form.
// Keep aligned with server-side rules.

export type PasswordPolicy = {
  minLength: number
  requireUpper: boolean
  requireLower: boolean
  requireDigit: boolean
  requireSymbol: boolean
  significantDiff?: number // how many chars must differ from old password (default 4)
}

// Common weak passwords (for quick rejection)
const COMMON_PASSWORDS = new Set([
  'password',
  '123456',
  '123456789',
  'qwerty',
  '111111',
  '12345678',
  'iloveyou',
  'abc123',
  '123123',
  '12345',
  '000000',
  'admin',
  'letmein',
])

// Max allowed password length
const MAX_LENGTH = 128

export type ValidatePasswordResult = {
  valid: boolean
  errors: string[]
}

// Main password validation function
export function validatePassword(
  next: string,
  old: string,
  policy: PasswordPolicy
): ValidatePasswordResult {
  const errors: string[] = []

  // Length checks
  if (!next) errors.push('New password is required.')
  if (next && next.length < policy.minLength)
    errors.push(`Must be at least ${policy.minLength} characters.`)
  if (next && next.length > MAX_LENGTH)
    errors.push(`Must be at most ${MAX_LENGTH} characters.`)

  // Character requirements
  if (next && policy.requireLower && !/[a-z]/.test(next)) errors.push('Add a lowercase letter.')
  if (next && policy.requireUpper && !/[A-Z]/.test(next)) errors.push('Add an uppercase letter.')
  if (next && policy.requireDigit && !/\d/.test(next)) errors.push('Add a number.')
  if (next && policy.requireSymbol && !/[^A-Za-z0-9]/.test(next))
    errors.push('Add a special character.')

  // Basic quality checks
  if (next && COMMON_PASSWORDS.has(next.toLowerCase()))
    errors.push('Too common. Please choose a stronger password.')
  if (next && old && next === old)
    errors.push('New password must differ from old password.')

  // Check for similarity with old password (when lengths match)
  const diffMin = policy.significantDiff ?? 4
  if (next && old && next.length === old.length && diffMin > 0) {
    let diff = 0
    for (let i = 0; i < next.length; i++) if (next[i] !== old[i]) diff++
    if (diff < diffMin)
      errors.push('New password must differ significantly from old password.')
  }

  // Combine missing character type errors into one message
  const categoryMissing =
    errors.includes('Add a lowercase letter.') ||
    errors.includes('Add an uppercase letter.') ||
    errors.includes('Add a number.') ||
    errors.includes('Add a special character.')

  if (categoryMissing) {
    return {
      valid: false,
      errors: ['Include upper, lower, number, and special character.'],
    }
  }

  return { valid: errors.length === 0, errors }
}
