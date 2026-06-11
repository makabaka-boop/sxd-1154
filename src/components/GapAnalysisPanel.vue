<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/30" @click="$emit('close')" />
      <div class="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col animate-slide-in">
        <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 class="font-semibold text-zinc-800 flex items-center gap-2">
            <ShieldAlert class="w-5 h-5 text-orange-500" />
            缺口分析
          </h3>
          <button @click="$emit('close')" class="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div v-if="groupedIssues.critical.length > 0" class="mb-6">
            <h4 class="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-red-500" />
              严重问题 ({{ groupedIssues.critical.length }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="(issue, idx) in groupedIssues.critical"
                :key="'c-' + idx"
                class="p-3 bg-red-50 rounded-lg border border-red-100"
              >
                <p class="text-sm text-red-800">{{ issue.message }}</p>
                <div class="flex items-center gap-2 mt-1.5">
                  <span class="text-xs text-red-500">{{ issue.course }}</span>
                  <button
                    v-if="issue.itemId"
                    @click="$emit('navigate', issue.itemId)"
                    class="text-xs text-teal-600 hover:text-teal-700 underline"
                  >
                    查看物品
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="groupedIssues.warning.length > 0">
            <h4 class="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-amber-500" />
              警告 ({{ groupedIssues.warning.length }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="(issue, idx) in groupedIssues.warning"
                :key="'w-' + idx"
                class="p-3 bg-amber-50 rounded-lg border border-amber-100"
              >
                <p class="text-sm text-amber-800">{{ issue.message }}</p>
                <div class="flex items-center gap-2 mt-1.5">
                  <span class="text-xs text-amber-500">{{ issue.course }}</span>
                  <button
                    v-if="issue.itemId"
                    @click="$emit('navigate', issue.itemId)"
                    class="text-xs text-teal-600 hover:text-teal-700 underline"
                  >
                    查看物品
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="issues.length === 0" class="text-center py-12 text-zinc-400">
            <CheckCircle class="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p class="text-sm">暂无缺口问题</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, ShieldAlert, CheckCircle } from 'lucide-vue-next'
import type { CheckIssue } from '@/composables/useAutoCheck'

const props = defineProps<{
  show: boolean
  issues: CheckIssue[]
}>()

defineEmits<{
  close: []
  navigate: [itemId: string]
}>()

const groupedIssues = computed(() => {
  const critical = props.issues.filter((i) => i.severity === 'critical')
  const warning = props.issues.filter((i) => i.severity === 'warning')
  return { critical, warning }
})
</script>
