import { nextTick, ref } from "vue";

/**
 * `useFocus` is a generic composable which allows custom components to expose a `focus` method.
 *
 * In order to use this composable in your component, you need to configure it like this:
 *
 * @example
 * ```
 * <template>
 *   <input type="text" … ref="inputRef" />
 * </template>
 *
 * <script setup>
 *   import { useFocus } from './useFocus'
 *
 *   const { elementRef: inputRef, focus } = useFocus<HTMLInputElement>()
 * </script>
 * ```
 *
 * To call the `focus` method from outside of your component, do this:
 *
 * @example
 * ```
 * <template>
 *   <DynMyComponent
 *     ref="myRef"
 *   />
 * </template>
 *
 * <script setup>
 *   import { onMounted, ref } from 'vue'
 *
 *   const myRef = ref<typeof DynMyComponent>()
 *
 *   onMounted(() => {
 *     nameInput.value?.focus()
 *   })
 * </script>
 * ```
 */
export const useFocus = <T extends HTMLElement>() => {
  const elementRef = ref<T>();

  const focus = () => {
    nextTick(() => {
      if (!elementRef.value) {
        return;
      }

      if (elementRef.value instanceof HTMLInputElement) {
        const input = elementRef.value;
        const type = input.type;

        if (
          ["email", "password", "search", "tel", "text", "url"].includes(type)
        ) {
          if (type === "email") {
            input.type = "text";
          }

          const end = input.value.length;
          input.setSelectionRange(end, end);

          if (type !== input.type) {
            input.type = type;
          }
        }
      }

      elementRef.value.focus();
    });
  };

  return {
    elementRef,
    focus,
  };
};
