<template>
  <div class="p-4 md:p-0 relative min-h-screen flex items-center justify-center text-white overflow-hidden">
    <!-- Background image -->
    <div class="absolute inset-0 bg-[url('@/assets/dyn-bg.webp')] bg-cover bg-center bg-fixed"></div>

    <!-- Dark transparent overlay -->
    <div class="absolute inset-0 bg-[#001b3d]/70"></div>

    <!-- Main content -->
    <div class="relative z-10 w-full md:w-[500px]">
      <!-- Tabs for switching between variants -->
      <div
        class="mx-auto w-full sm:w-[400px] md:w-[500px] lg:w-[600px] mt-10 rounded-xl border-white/10 bg-white/5 backdrop-blur"
        role="tablist" aria-label="Password box variants">
        <div class="grid grid-cols-2">
          <!-- Inline-change tab -->
          <button role="tab" :aria-selected="activeTab === 'inline-change'"
            :tabindex="activeTab === 'inline-change' ? 0 : -1"
            class="py-3 text-center tracking-wider font-semibold transition-colors" :class="activeTab === 'inline-change'
              ? 'text-white bg-white/10 rounded-xl'
              : 'text-white/70 hover:text-white/90 rounded-xl'
              " @click="setTab('inline-change')" @keydown.left.prevent="setTab('inline-change')"
            @keydown.right.prevent="setTab('lean-save')">
            Inline (“Change password”)
          </button>

          <!-- Lean-save tab -->
          <button role="tab" :aria-selected="activeTab === 'lean-save'" :tabindex="activeTab === 'lean-save' ? 0 : -1"
            class="py-3 text-center tracking-wider font-semibold transition-colors" :class="activeTab === 'lean-save'
              ? 'text-white bg-white/10 rounded-xl'
              : 'text-white/70 hover:text-white/90 rounded-xl'
              " @click="setTab('lean-save')" @keydown.left.prevent="setTab('inline-change')"
            @keydown.right.prevent="setTab('lean-save')">
            Lean (“Save”)
          </button>
        </div>
      </div>

      <!-- PasswordBox content -->
      <div role="tabpanel" :aria-labelledby="activeTab" class="mt-6">
        <PasswordBox :variant="activeTab" :key="activeTab" />
      </div>
    </div>
    <ToastHost />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PasswordBox from './components/PasswordBox.vue'
import ToastHost from '@/components/ToastHost.vue'

// Variants:
// 'inline-change' = inline validation + "Change Password"
// 'lean-save' = minimal version with simple save
type Variant = 'inline-change' | 'lean-save'
const activeTab = ref<Variant>('inline-change')

// Change active tab
function setTab(v: Variant) {
  activeTab.value = v
}
</script>
