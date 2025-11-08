<template>
  <!-- 
    Password Visibility Toggle Button
    - Dynamically switches between "eye" and "eye-off" icons.
    - Positioned absolutely inside input wrapper (right-aligned).
    - Emits no events; instead, calls composable methods on the bound input ref.
  -->
  <button type="button" @click="toggle" class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6
           text-gray-400 hover:text-[#2596be] transition">
    <!-- "Eye Off" Icon (when password is shown) -->
    <svg v-if="isPasswordShown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6"
      aria-hidden="true">
      <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path
          d="M19.518 8.288A22 22 0 0 1 23.5 12s-5.148 6.5-11.5 6.5a10.3 10.3 0 0 1-3-.464M4.468 15.7A22 22 0 0 1 .5 12S5.648 5.5 12 5.5a10.1 10.1 0 0 1 2.5.325" />
        <path d="M8 12a4 4 0 0 1 4-4m4 4a4 4 0 0 1-4 4m9.75-13.75-19.5 19.5" />
      </g>
    </svg>

    <!-- "Eye" Icon (when password is hidden) -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6" aria-hidden="true">
      <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4.818-7 11-7 11 7 11 7-4.818 7-11 7S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </g>
    </svg>
  </button>
</template>

<script lang="ts" setup>
/**
 * DynInputPasswordToggle.vue
 * --------------------------------------------
 * A stateless button component that toggles password visibility.
 * It directly communicates with a parent input via ref (composition pattern).
 * Safe for reuse with any input using the useInputPasswordToggle composable.
 */

import { computed, type Ref } from 'vue'

// ------------------------------
// Types
// ------------------------------
/**
 * ToggleTarget interface:
 * - isPasswordShown: reactive boolean state (from composable)
 * - onTogglePassword: method to toggle visibility
 * - focus: method to re-focus input after toggle
 */
type ToggleTarget = {
  isPasswordShown?: Ref<boolean>
  onTogglePassword?: () => void
  focus?: () => void
}

// ------------------------------
// Props
// ------------------------------
/**
 * The targetRef is a reference to the input component instance or its exposed API.
 * It can be passed directly (object) or as a ref (Ref<object>).
 */
const props = defineProps<{
  targetRef: ToggleTarget | Ref<ToggleTarget | null> | null
}>()

// ------------------------------
// Reactive Mappings
// ------------------------------
/**
 * Normalize the targetRef:
 * - Accepts both direct and reactive references.
 * - Returns `null` if invalid or undefined.
 */
const target = computed<ToggleTarget | null>(() => {
  const t = props.targetRef as any
  return t && typeof t === 'object' && 'value' in t ? t.value : t
})

/**
 * Determine current visibility state.
 * Handles both raw booleans and Ref<boolean>.
 */
const isPasswordShown = computed(() => {
  const shown = target.value?.isPasswordShown
  return typeof shown === 'boolean' ? shown : !!(shown && (shown as any).value)
})

// ------------------------------
// Methods
// ------------------------------
/**
 * Toggle password visibility and refocus input.
 * Gracefully ignores missing handlers (optional chaining).
 */
function toggle() {
  target.value?.onTogglePassword?.()
  target.value?.focus?.()
}
</script>
