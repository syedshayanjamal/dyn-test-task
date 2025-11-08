<template>
  <div class="relative w-full">
    <!-- Label Section -->
    <!-- Dynamically color label based on invalid/disabled state -->
    <label :for="computedId" class="block text-sm font-medium mb-1"
      :class="invalid ? 'text-red-500' : disabled ? 'text-gray-400' : 'text-gray-200'">
      {{ label }} <span class="text-red-500">*</span>
    </label>

    <!-- Input Wrapper -->
    <div class="relative">
      <!-- Main Input Field -->
      <!-- 
        Tailwind styles:
        - Glass-like background (bg-[#04223e]/40)
        - Smooth hover/focus transitions
        - Dynamic colors for error, disabled, and active states
        - Prevent spacebar input (@keydown.space.prevent)
      -->
      <input v-model="computedModelValue" :type="internalType" v-bind="computedProps" :id="computedId" ref="inputRef"
        style="outline: none !important;" class="peer w-full max-h-12 rounded-lg border border-[#ffffff29] bg-[#04223e]/40 px-4 pt-[15px] pb-3.5 leading-none text-white placeholder:text-gray-400 placeholder:opacity-0 placeholder:transition-opacity outline-none transition-all
          focus:border-[#2596be] focus:placeholder:opacity-100
          hover:text-[#2596be] enabled:[&:not(readonly)]:focus:border-[#2596be] enabled:[&:not(readonly)]:focus:text-white
          disabled:opacity-60 disabled:bg-gray-800" :class="[
            invalid
              ? 'border-red-500 text-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : disabled
                ? 'text-gray-400 border-gray-600 bg-gray-700'
                : 'text-white border-gray-600 focus:border-blue-500 focus:ring-0',
            $slots.append ? 'pr-12' : ''
          ]" @blur="$emit('blur', $event)" @focus="$emit('focus', $event)" @keydown="$emit('keydown', $event)"
        @keypress="$emit('keypress', $event)" @keyup="$emit('keyup', $event)" @keydown.space.prevent
        @paste="onPasteNoSpace" />

      <!-- Optional Append Slot (e.g. eye icon, button, etc.) -->
      <span v-if="$slots.append" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto">
        <slot name="append" :disabled="disabled" :invalid="invalid" :readonly="readonly" />
      </span>
    </div>

    <!-- Validation Message -->
    <p v-if="invalid && typeof invalid === 'string'" class="text-sm mt-1 text-red-500">
      {{ invalid }}
    </p>
  </div>
</template>

<script lang="ts" setup>
/**
 * DynInput.vue
 * ------------------------------
 * A highly reusable, production-ready input component built with Vue 3 + TS.
 * Supports password toggling, validation states, and clean composable integration.
 */

import { computed, defineProps, defineEmits, toRef } from 'vue'
import { useFocus } from '@/composables/useInputFocus'
import { useInputPasswordToggle } from '@/composables/useInputPasswordToggle'
import type { PropType, InputTypeHTMLAttribute, InputHTMLAttributes } from 'vue'

// ------------------------------
// Props Definition
// ------------------------------
const props = defineProps({
  autocomplete: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: undefined },
  inputmode: { type: String as PropType<InputHTMLAttributes['inputmode']>, default: undefined },
  invalid: { type: [Boolean, String], default: false }, // Accepts true/false or string message
  label: { type: String, required: true },
  maxlength: { type: Number, default: undefined },
  minlength: { type: Number, default: undefined },
  modelValue: { type: [String, Number], required: true },
  name: { type: String, required: true },
  placeholder: { type: String, default: undefined },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  tabindex: { type: Number, default: undefined },
  type: {
    type: String as PropType<InputTypeHTMLAttribute>,
    default: 'text',
    validator: (v: InputTypeHTMLAttribute) => ['password', 'text'].includes(v),
  },
})

// ------------------------------
// Emits Definition
// ------------------------------
const emit = defineEmits([
  'blur',
  'focus',
  'input',
  'keydown',
  'keypress',
  'keyup',
  'update:modelValue',
])

// ------------------------------
// Composables
// ------------------------------
const { elementRef: inputRef, focus } = useFocus<HTMLInputElement>()
const { internalPasswordType, isPasswordShown, onTogglePassword } =
  useInputPasswordToggle(toRef(props, 'type'))

// ------------------------------
// Computed Properties
// ------------------------------

// Derived input type (handles password toggle)
const internalType = computed<InputTypeHTMLAttribute>(() => internalPasswordType.value)

// Fallback ID to name if no custom id provided
const computedId = computed(() => props.id || props.name)

// Two-way binding bridge for v-model
const computedModelValue = computed({
  get() {
    return props.modelValue as string | number
  },
  set(val: string | number) {
    emit('update:modelValue', val)
  },
})

// Bundle all optional native input props for v-bind
const computedProps = computed(() => ({
  autocomplete: props.autocomplete,
  disabled: props.disabled,
  id: computedId.value,
  inputmode: props.inputmode,
  maxlength: props.maxlength,
  minlength: props.minlength,
  name: props.name,
  placeholder: props.placeholder,
  readonly: props.readonly,
  required: props.required,
  tabindex: props.tabindex,
}))

// ------------------------------
// Event Handlers
// ------------------------------

/**
 * Prevent pasting values containing spaces (for security / password fields)
 * @param e ClipboardEvent
 */
function onPasteNoSpace(e: ClipboardEvent) {
  const pasted = e.clipboardData?.getData('text') ?? ''
  if (pasted.includes(' ')) {
    e.preventDefault()
  }
}

// ------------------------------
// Exposed Methods (for parent refs)
// ------------------------------
defineExpose({
  focus,             // Programmatically focus input
  inputRef,          // Access raw DOM input element
  isPasswordShown,   // Reactive password visibility state
  onTogglePassword,  // Method to toggle password visibility
  internalType,      // Exposed computed input type
})
</script>

<style scoped>
/* Keep empty for scoped overrides or theme extensions */
</style>