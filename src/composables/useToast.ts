// src/composables/useToast.ts
import { reactive } from 'vue'

type Kind = 'success' | 'error' | 'info'
type Toast = { id: number; kind: Kind; message: string }

const state = reactive<{ items: Toast[] }>({ items: [] })
let uid = 0

function push(kind: Kind, message: string, ms = 3000) {
  const t = { id: ++uid, kind, message }
  state.items.push(t)
  setTimeout(() => remove(t.id), ms)
}

function remove(id: number) {
  const i = state.items.findIndex(t => t.id === id)
  if (i > -1) state.items.splice(i, 1)
}

export function useToast() {
  return {
    toasts: state.items,
    success: (m: string, ms?: number) => push('success', m, ms),
    error: (m: string, ms?: number) => push('error', m, ms),
    info: (m: string, ms?: number) => push('info', m, ms),
    remove,
  }
}
