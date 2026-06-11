<template>
  <div
    v-if="selectedIds.length > 0"
    class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 shadow-lg animate-slide-up"
  >
    <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
      <span class="text-sm text-zinc-600">
        已选择 <strong class="text-teal-700">{{ selectedIds.length }}</strong> 项
      </span>
      <div class="flex items-center gap-2">
        <button
          v-for="status in batchStatuses"
          :key="status.value"
          @click="$emit('batchUpdate', status.value)"
          :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', status.class]"
        >
          {{ status.label }}
        </button>
        <button
          @click="$emit('clearSelection')"
          class="ml-2 px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
        >
          取消选择
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemStatus } from '@/types'

defineProps<{ selectedIds: string[] }>()
defineEmits<{
  batchUpdate: [status: ItemStatus]
  clearSelection: []
}>()

const batchStatuses: { value: ItemStatus; label: string; class: string }[] = [
  { value: 'pending', label: '待准备', class: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200' },
  { value: 'ready', label: '已备齐', class: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
  { value: 'supplement', label: '需补充', class: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { value: 'suspended', label: '暂停使用', class: 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300' },
]
</script>
