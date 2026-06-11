<template>
  <div
    :class="[
      'group flex items-center gap-3 px-4 py-3 border-b border-zinc-100 cursor-pointer transition-all duration-150',
      isDetailSelected ? 'bg-teal-50 border-l-2 border-l-teal-600' : 'hover:bg-zinc-50 border-l-2 border-l-transparent',
      isCheckMode && !isGapItem ? 'opacity-30' : '',
    ]"
    @click="$emit('select', item.id)"
  >
    <input
      type="checkbox"
      :checked="isBatchSelected"
      @click.stop
      @change="$emit('toggleSelect', item.id)"
      class="w-4 h-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
      :disabled="!canBatchEdit"
    />

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="font-medium text-zinc-800 truncate">{{ item.name }}</span>
        <span
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          :style="{ backgroundColor: categoryColor + '18', color: categoryColor }"
        >
          {{ categoryName }}
        </span>
        <span v-if="item.gapLevel === 'critical'" class="flex items-center gap-0.5 text-xs text-red-600 font-medium">
          <AlertTriangle class="w-3 h-3" />
          缺口
        </span>
        <span v-else-if="item.gapLevel === 'warning'" class="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
          <AlertTriangle class="w-3 h-3" />
          重复
        </span>
      </div>
      <div class="flex items-center gap-3 mt-1 text-xs text-zinc-400">
        <span>{{ item.course }}</span>
        <span>·</span>
        <span>{{ item.responsible || '未指定' }}</span>
        <span>·</span>
        <span :class="item.quantity < item.minQuantity ? 'text-red-500 font-medium' : ''">
          {{ item.quantity }}/{{ item.minQuantity }}
        </span>
      </div>
    </div>

    <span
      :class="[
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        statusClass,
      ]"
    >
      {{ STATUS_LABELS[item.status] }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import type { Item, ItemStatus } from '@/types'
import { STATUS_LABELS } from '@/types'

const props = defineProps<{
  item: Item
  isDetailSelected: boolean
  isBatchSelected: boolean
  categoryName: string
  categoryColor: string
  canEdit: boolean
  canBatchEdit: boolean
  isCheckMode: boolean
}>()

defineEmits<{
  select: [id: string]
  toggleSelect: [id: string]
}>()

const isGapItem = computed(
  () =>
    props.item.status === 'pending' ||
    props.item.status === 'supplement' ||
    props.item.gapLevel === 'critical' ||
    props.item.gapLevel === 'warning'
)

const statusClass = computed(() => {
  const map: Record<ItemStatus, string> = {
    pending: 'bg-zinc-100 text-zinc-600',
    ready: 'bg-emerald-100 text-emerald-700',
    supplement: 'bg-orange-100 text-orange-700',
    suspended: 'bg-zinc-200 text-zinc-500 line-through',
  }
  return map[props.item.status]
})
</script>
