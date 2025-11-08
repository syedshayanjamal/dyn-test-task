<template>
  <div class="flex mt-15 items-center justify-center">
    <div class="w-full max-w-lg space-y-6">
      <!-- Step indicator (purely visual progress: 1=intro, 2=form) -->
      <div class="flex items-center justify-center gap-2 w-full sm:w-[500px] lg:w-[600px]">
        <span :class="dotClass(1)" />
        <span :class="dotClass(2)" />
      </div>

      <!-- STEP 1: Soft intro card to reduce friction before showing form -->
      <section v-if="step === 1"
        class="w-full sm:w-[500px] lg:w-[600px] rounded-2xl border border-white/10 bg-white/1 backdrop-blur-lg p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] space-y-5">
        <h2 class="text-2xl font-bebas tracking-wide text-white text-center">Secure Your Account</h2>
        <p class="text-m text-white/80 text-center">
          Keep your account safe by updating your password regularly. Click below to continue.
        </p>
        <div class="pt-2">
          <button
            class="w-full inline-flex items-center justify-center px-4 py-3 bg-[#16b1d1] text-black font-bebas text-lg tracking-wide rounded-lg hover:bg-[#8ad8e8] transition-colors duration-200"
            @click="step = 2" type="button">
            Continue
          </button>
        </div>
      </section>

      <!-- STEP 2: Main form (glass card) -->
      <section v-else
        class="w-full sm:w-[500px] lg:w-[600px] rounded-2xl border border-white/10 bg-white/1 backdrop-blur-lg p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] space-y-5">
        <div class="flex items-start justify-between">
          <h2 class="text-2xl font-bebas tracking-wide text-white text-center w-full">Change Your Password</h2>
        </div>

        <!-- Old Password (required; basic non-empty validation) -->
        <div class="space-y-1">
          <DynInput ref="oldRef" v-model="oldPassword" name="oldPassword" label="Old Password" type="password"
            placeholder="Enter old password" :invalid="(showInline || triedSubmit) && !!errors.oldPassword">
            <template #append>
              <!-- Stateless toggle button talks to DynInput via exposed API -->
              <DynInputPasswordToggle :targetRef="oldRef" />
            </template>
          </DynInput>

          <!-- Secondary action: recovery flow (kept inline for discoverability) -->
          <div class="mt-1 text-right">
            <a href="#" class="text-xs text-[#16b1d1] hover:text-[#8ad8e8] hover:underline"
              @click.prevent="onForgotPassword">
              Forgot password?
            </a>
          </div>

          <p v-if="(showInline || triedSubmit) && errors.oldPassword" class="text-red-500 text-sm">
            {{ errors.oldPassword }}
          </p>
        </div>

        <!-- New Password (policy-driven validation) -->
        <DynInput ref="newRef" v-model="newPassword" name="newPassword" label="New Password" type="password"
          placeholder="Enter new password" :invalid="(showInline || triedSubmit) && !!errors.newPassword">
          <template #append>
            <DynInputPasswordToggle :targetRef="newRef" />
          </template>
        </DynInput>
        <p v-if="(showInline || triedSubmit) && errors.newPassword" class="text-red-500 text-sm">
          {{ errors.newPassword }}
        </p>

        <!-- Inline policy hints: live feedback only for inline-change variant -->
        <ul v-if="showInline && newPassword" class="mt-1 list-disc pl-5 text-sm text-white/80">
          <li :class="{ 'text-green-400': newPassword.length >= 8 }">At least 8 characters</li>
          <li :class="{ 'text-green-400': /[A-Z]/.test(newPassword) }">One uppercase letter</li>
          <li :class="{ 'text-green-400': /[a-z]/.test(newPassword) }">One lowercase letter</li>
          <li :class="{ 'text-green-400': /\d/.test(newPassword) }">One number</li>
          <li :class="{ 'text-green-400': /[^A-Za-z0-9]/.test(newPassword) }">One special character</li>
        </ul>

        <!-- Confirm Password (strict match with new password) -->
        <DynInput ref="confirmRef" v-model="confirmPassword" name="confirmPassword" label="Confirm Password"
          type="password" placeholder="Re-enter new password"
          :invalid="(showInline || triedSubmit) && !!errors.confirmPassword">
          <template #append>
            <DynInputPasswordToggle :targetRef="confirmRef" />
          </template>
        </DynInput>
        <p v-if="(showInline || triedSubmit) && errors.confirmPassword" class="text-red-500 text-sm">
          {{ errors.confirmPassword }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3">
          <!-- Back: hard refresh to guarantee clean state (safer than step=1 if upstream state may linger) -->
          <button type="button"
            class="flex-1 tracking-wide text-lg inline-flex items-center justify-center px-4 py-3 border border-[#16b1d1] text-[#16b1d1] font-bebas rounded-lg hover:text-[#8ad8e8] hover:border-[#8ad8e8] transition-colors duration-200"
            @click="handleBack" :disabled="isLoading">
            Back
          </button>

          <!-- Submit:
               - Disabled when composable loading=true (server request in-flight)
               - Label swaps for processing/success states
            -->
          <button type="button"
            class="flex-1 inline-flex items-center justify-center px-4 py-3 bg-[#16b1d1] text-black text-lg font-bebas rounded-lg hover:bg-[#8ad8e8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
            @click="handleSubmit" :disabled="loading">
            <span v-if="!loading && !success">{{ submitLabel }}</span>
            <span v-if="loading">Processing...</span>
            <span v-if="success">Password Changed</span>
          </button>
        </div>

        <!-- Global error banner (non-field specific) -->
        <div v-if="isError" class="text-red-500 text-sm text-center mt-2">{{ isError }}</div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PasswordBox.vue
 * -----------------------------------------------------------------------------
 * 2-step password change flow with:
 * - UX warm-up screen (Step 1) → reduces drop-off.
 * - Strict client-side validation against a policy (Step 2).
 * - Clear inline field errors + optional live rule hints (inline variant).
 * - Server update via composable; safely handles loading/success/error states.
 */

import { ref, computed, watch } from 'vue'
import DynInput from './DynInput.vue'
import DynInputPasswordToggle from './DynInputPasswordToggle.vue'
import { validatePassword } from '@/composables/usePasswordRules'
import { useUpdatePassword } from '@/composables/useUpdatePassword'
import type { PasswordPolicy } from '@/types'
import { useToast } from '@/composables/useToast'

const { success: toastSuccess, error: toastError } = useToast()

// -----------------------------------------------------------------------------
// Password policy (centralized; keep in sync with server policy if applicable)
// -----------------------------------------------------------------------------
const policy: PasswordPolicy = {
  minLength: 8,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
  requireSymbol: true,
  significantDiff: 4, // avoid trivial changes vs old password (e.g., +1)
}

// (Optional/local dev identifiers; safe to remove in production if unused)
const testId = 'local_test'
const variant = 'default'

// -----------------------------------------------------------------------------
// Props / UX Variants
//  - inline-change: allow attempts with live hints
//  - lean-save: stricter button enablement, fewer inline hints
// -----------------------------------------------------------------------------
const props = defineProps<{ variant?: 'inline-change' | 'lean-save' }>()
const showInline = computed(() => (props.variant ?? 'inline-change') === 'inline-change')
const submitLabel = computed(() =>
  (props.variant ?? 'inline-change') === 'inline-change' ? 'Change Password' : 'Save'
)
const triedSubmit = ref(false) // gate for showing validation messages in lean mode

// -----------------------------------------------------------------------------
// Stepper UI
// -----------------------------------------------------------------------------
const step = ref<1 | 2>(1)
const dotClass = (n: number) =>
  `h-2.5 w-2.5 rounded-full ${step.value === n ? 'bg-[#2596be]' : 'bg-white/25'}`

// -----------------------------------------------------------------------------
// Refs to child inputs (for toggles/focus via exposed APIs)
// -----------------------------------------------------------------------------
const oldRef = ref()
const newRef = ref()
const confirmRef = ref()

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Local UI flags (separate from composable's loading/success/error)
const isLoading = ref(false)   // NOTE: you also have `loading` from composable; keep one source of truth if possible.
const isSuccess = ref(false)
const isError = ref('')

// Field-level errors (first error per field for clarity)
const errors = ref<{ oldPassword: string; newPassword: string; confirmPassword: string }>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// (Optional) quick reject list; ideally enforced server-side too
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', '111111', '12345678', 'iloveyou',
  'abc123', '123123', '12345', '000000', 'admin', 'letmein'
])

// Server integration (single source of truth for remote state)
const { loading, error, success, update } = useUpdatePassword(policy)

// -----------------------------------------------------------------------------
// Navigation
// -----------------------------------------------------------------------------
/**
 * Hard reload ensures all upstream state (e.g., auth tokens, cache) resets.
 * Prefer this if going "back" should guarantee a clean slate.
 */
function handleBack() {
  window.location.reload()
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------
/**
 * Run synchronous validations before server call.
 * - Non-empty old password
 * - New password must satisfy policy (validatePassword composable)
 * - Confirm must match new
 */
function validate() {
  let ok = true
  errors.value = { oldPassword: '', newPassword: '', confirmPassword: '' }

  const oldVal = oldPassword.value?.toString() ?? ''
  const newVal = newPassword.value?.toString() ?? ''
  const confirmVal = confirmPassword.value?.toString() ?? ''

  if (!oldVal) {
    errors.value.oldPassword = 'Old password is required.'
    ok = false
  }

  // Policy validation (returns first failing error message for simplicity)
  const { valid, errors: ruleErrors } = validatePassword(newVal, oldVal, policy)
  if (!valid) {
    errors.value.newPassword = ruleErrors[0]
    ok = false
  }

  if (!confirmVal) {
    errors.value.confirmPassword = 'Please confirm your new password.'
    ok = false
  } else if (confirmVal !== newVal) {
    errors.value.confirmPassword = 'Passwords do not match.'
    ok = false
  }

  // Optional: block widely known weak passwords (defense-in-depth)
  if (ok && COMMON_PASSWORDS.has(newVal.toLowerCase())) {
    errors.value.newPassword = 'This password is too common. Please choose a stronger one.'
    ok = false
  }

  return ok
}

// -----------------------------------------------------------------------------
// Telemetry (example stub; wire to your analytics)
// -----------------------------------------------------------------------------
function trackEvent(status: string) {
  console.log(JSON.stringify({ event: 'password_change', status, timestamp: new Date().toISOString() }))
}

// Button enablement logic (kept for reference; currently not wired to the button)
const isPrimarilyDisabled = computed(() => {
  if (isLoading.value) return true
  if (showInline) return false // allow attempts to leverage inline guidance
  return !oldPassword.value || !newPassword.value || !confirmPassword.value
})

// -----------------------------------------------------------------------------
// Submit flow
//  - Validate locally → call server → normalize success/error UI
// -----------------------------------------------------------------------------
async function handleSubmit() {
  triedSubmit.value = true
  errors.value = { oldPassword: '', newPassword: '', confirmPassword: '' }

  // Local validation (fast-fail, avoid unnecessary network call)
  if (!validate()) return

  // Fire server request (composable manages `loading`, `success`, `error`)
  const result = await update(oldPassword.value, newPassword.value)

  if (result) {
    // ✅ Success: clear sensitive fields and show positive state
    isSuccess.value = true
    isError.value = ''
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    trackEvent('success')
    toastSuccess('Password changed successfully')
  } else {
    // ❌ Failure: surface composable error both globally and on the new password field
    trackEvent('failure')
    const msg = error.value || 'Password change failed.'
    if (error.value) {
      errors.value.newPassword = error.value
      isError.value = error.value
    } else {
      isError.value = msg
    }
    toastError(msg)
  }
}

// -----------------------------------------------------------------------------
// Live UX: clear errors on user edits to reduce frustration
// -----------------------------------------------------------------------------
watch(newPassword, () => {
  errors.value.newPassword = ''
  if (!showInline.value) triedSubmit.value = false
})
watch(confirmPassword, () => {
  errors.value.confirmPassword = ''
  if (!showInline.value) triedSubmit.value = false
})
watch(oldPassword, () => {
  errors.value.oldPassword = ''
  if (!showInline.value) triedSubmit.value = false
})

// -----------------------------------------------------------------------------
// Secondary actions
// -----------------------------------------------------------------------------
function onForgotPassword() {
  // Replace with real navigation or modal trigger for recovery flow
  console.log('Forgot password clicked!')
}
</script>

<style scoped>
/* Scoped for future overrides; visual system is handled via Tailwind utility classes. */
</style>
