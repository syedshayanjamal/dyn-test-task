/**
 * @internal
 *
 * `useInternalDynInputPasswordToggle` is an internal composable for toggling
 * the visibility of a password in a `DynInput` of `type="password"`.
 *
 * You can make us of it like this in your app:
 *
 * @example
 * ```
 * <template>
 *   <DynInput
 *     ref="passwordRef"
 *     type="password"
 *     …
 *   >
 *     <template #append>
 *       <DynInputPasswordToggle :targetRef="passwordRef" />
 *     </template>
 *   </DynInput>
 * </template>
 *
 * <script setup>
 *   const passwordRef = ref<typeof DynInput>()
 * </script>
 * ```
 *
 * To call the `focus` method from outside of your component, do this:
 *
 */
import { computed, ref, type Ref } from "vue";
import type { InputTypeHTMLAttribute } from "vue";

/**
 * Creates reactive bindings for toggling password visibility.
 *
 * @param typeRef - A reactive reference to the input's `type` attribute (usually `'password'` or `'text'`).
 * @returns An object containing:
 *  - `internalPasswordType`: Computed input type (`'password'` | `'text'`)
 *  - `isPasswordShown`: Reactive boolean indicating if password is visible
 *  - `onTogglePassword`: Function to toggle visibility
 */
export function useInputPasswordToggle(typeRef: Ref<InputTypeHTMLAttribute>) {
  /** Current visibility state of the password */
  const isPasswordShown = ref(false);

  /**
   * Computed input type:
   * - Returns `'text'` when `isPasswordShown` is true
   * - Returns `'password'` otherwise
   * - If base type is not `'password'`, it stays untouched (safety guard)
   */
  const internalPasswordType = computed<InputTypeHTMLAttribute>(() => {
    const base = typeRef.value;
    if (base !== "password") return base; // skip for non-password inputs
    return isPasswordShown.value ? "text" : "password";
  });

  /**
   * Toggle visibility of password fields.
   * Only operates if the original input type is `'password'`.
   */
  function onTogglePassword() {
    if (typeRef.value === "password") {
      isPasswordShown.value = !isPasswordShown.value;
    }
  }

  // Public API
  return { internalPasswordType, isPasswordShown, onTogglePassword };
}
