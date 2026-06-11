<template>
  <div
    v-if="issues.length > 0"
    :class="[
      'rounded-lg border px-4 py-3 mb-4 transition-all duration-300',
      collapsed ? 'py-2' : '',
      criticalCount > 0
        ? 'bg-red-50 border-red-200'
        : 'bg-amber-50 border-amber-200',
    ]"
  >
    <div class="flex items-center justify-between cursor-pointer" @click="collapsed = !collapsed">
      <div class="flex items-center gap-3">
        <div
          :class="[
            'flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
            criticalCount > 0
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700',
          ]"
        >
          <AlertTriangle class="w-3.5 h-3.5" />
          {{ criticalCount > 0 ? `${criticalCount} 个严重问题` : `${warningCount} 个警告` }}
        </div>
        <span class="text-sm text-zinc-500">
          共 {{ issues.length }} 条自动检查提示
        </span>
      </div>
      <button class="text-zinc-400 hover:text-zinc-600 transition-colors">
        <ChevronDown :class="['w-4 h-4 transition-transform', collapsed ? '' : 'rotate-180']" />
      </button>
    </div>
    <div v-if="!collapsed" class="mt-3 space-y-1.5">
      <div
        v-for="(issue, idx) in issues.slice(0, 10)"
        :key="idx"
        class="flex items-start gap-2 text-sm"
      >
        <div
          :class="[
            'mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
            issue.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500',
          ]"
        />
        <span :class="issue.severity === 'critical' ? 'text-red-700' : 'text-amber-700'">
          {{ issue.message }}
        </span>
      </div>
      <div v-if="issues.length > 10" class="text-xs text-zinc-400 pl-3.5">
        ...还有 {{ issues.length - 10 }} 条提示
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, ChevronDown } from 'lucide-vue-next'
import type { CheckIssue } from '@/composables/useAutoCheck'

defineProps<{
  issues: CheckIssue[]
  criticalCount: number
  warningCount: number
}>()

const collapsed = ref(false)
</script>
