<!-- src/components/ToastHost.vue -->
<template>
  <div class="fixed inset-0 z-[9999] pointer-events-none">
    <div class="absolute top-4 right-4 w-full max-w-sm space-y-2">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg"
        :class="{
          'bg-emerald-600 text-white': t.kind === 'success',
          'bg-rose-600 text-white': t.kind === 'error',
          'bg-slate-800 text-white': t.kind === 'info',
        }"
      >
        <span class="font-semibold capitalize">{{ t.kind }}</span>
        <span class="opacity-95">{{ t.message }}</span>
        <button class="ml-auto opacity-80 hover:opacity-100" @click="remove(t.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
const { toasts, remove } = useToast()
</script>
