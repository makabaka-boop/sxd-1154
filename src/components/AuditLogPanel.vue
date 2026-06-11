<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/30" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col animate-slide-in">
        <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 class="font-semibold text-zinc-800 flex items-center gap-2">
            <History class="w-5 h-5 text-teal-600" />
            变更记录
          </h3>
          <button @click="$emit('close')" class="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div v-if="logs.length === 0" class="text-center py-12 text-zinc-400">
            <History class="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p class="text-sm">暂无变更记录</p>
          </div>

          <div v-else class="space-y-0">
            <div
              v-for="log in logs"
              :key="log.id"
              class="flex gap-3 pb-4 relative"
            >
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5',
                    actionColorMap[log.action],
                  ]"
                />
                <div class="w-px flex-1 bg-zinc-100 mt-1" />
              </div>
              <div class="flex-1 min-w-0 pb-1">
                <div class="flex items-center gap-2">
                  <span :class="['text-xs font-medium px-1.5 py-0.5 rounded', actionLabelClass[log.action]]">
                    {{ actionLabelMap[log.action] }}
                  </span>
                  <span class="text-xs text-zinc-400">{{ formatTime(log.timestamp) }}</span>
                </div>
                <p class="text-sm text-zinc-700 mt-1">{{ log.detail }}</p>
                <div class="text-xs text-zinc-400 mt-0.5">
                  {{ log.operator }} · {{ ROLE_LABELS[log.role] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, History } from 'lucide-vue-next'
import type { AuditLogEntry } from '@/types'
import { ROLE_LABELS } from '@/types'

defineProps<{
  show: boolean
  logs: AuditLogEntry[]
}>()

defineEmits<{ close: [] }>()

const actionLabelMap: Record<string, string> = {
  create: '创建',
  update: '更新',
  delete: '删除',
  batch_status: '批量操作',
}

const actionColorMap: Record<string, string> = {
  create: 'bg-emerald-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  batch_status: 'bg-amber-500',
}

const actionLabelClass: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  batch_status: 'bg-amber-100 text-amber-700',
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>
