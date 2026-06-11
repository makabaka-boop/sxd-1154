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

        <div class="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 bg-zinc-50">
          <button
            @click="groupBy = 'severity'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              groupBy === 'severity'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100',
            ]"
          >
            <AlertOctagon class="w-3.5 h-3.5" />
            按严重程度
          </button>
          <button
            @click="groupBy = 'course'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              groupBy === 'course'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100',
            ]"
          >
            <BookOpen class="w-3.5 h-3.5" />
            按课程分组
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <template v-if="groupBy === 'severity'">
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
                      @click="handleNavigate(issue.itemId, issue.course)"
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
                      @click="handleNavigate(issue.itemId, issue.course)"
                      class="text-xs text-teal-600 hover:text-teal-700 underline"
                    >
                      查看物品
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              v-for="(group, course) in courseGroupedIssues"
              :key="course"
              class="mb-5 last:mb-0"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                  <BookOpen class="w-3.5 h-3.5 text-teal-600" />
                  {{ course }}
                </h4>
                <div class="flex items-center gap-2">
                  <span
                    v-if="group.criticalCount > 0"
                    class="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded"
                  >
                    严重 {{ group.criticalCount }}
                  </span>
                  <span
                    v-if="group.warningCount > 0"
                    class="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
                  >
                    警告 {{ group.warningCount }}
                  </span>
                  <button
                    @click="handleFilterByCourse(course)"
                    class="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-0.5"
                  >
                    <Filter class="w-3 h-3" />
                    筛选课程
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(issue, idx) in group.issues"
                  :key="course + '-' + idx"
                  :class="[
                    'p-3 rounded-lg border',
                    issue.severity === 'critical'
                      ? 'bg-red-50 border-red-100'
                      : 'bg-amber-50 border-amber-100',
                  ]"
                >
                  <div class="flex items-start gap-2">
                    <div
                      :class="[
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                        issue.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500',
                      ]"
                    />
                    <div class="flex-1 min-w-0">
                      <p
                        :class="[
                          'text-sm',
                          issue.severity === 'critical' ? 'text-red-800' : 'text-amber-800',
                        ]"
                      >
                        {{ issue.message }}
                      </p>
                      <button
                        v-if="issue.itemId"
                        @click="handleNavigate(issue.itemId, course)"
                        class="text-xs text-teal-600 hover:text-teal-700 underline mt-1.5"
                      >
                        查看物品详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

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
import { ref, computed } from 'vue'
import { X, ShieldAlert, CheckCircle, BookOpen, Filter, AlertOctagon } from 'lucide-vue-next'
import type { CheckIssue } from '@/composables/useAutoCheck'

const props = defineProps<{
  show: boolean
  issues: CheckIssue[]
}>()

const emit = defineEmits<{
  close: []
  navigate: [itemId: string, course?: string]
  filterByCourse: [course: string]
}>()

const groupBy = ref<'severity' | 'course'>('severity')

const groupedIssues = computed(() => {
  const critical = props.issues.filter((i) => i.severity === 'critical')
  const warning = props.issues.filter((i) => i.severity === 'warning')
  return { critical, warning }
})

interface CourseIssueGroup {
  issues: CheckIssue[]
  criticalCount: number
  warningCount: number
}

const courseGroupedIssues = computed(() => {
  const map = new Map<string, CourseIssueGroup>()

  props.issues.forEach((issue) => {
    const group = map.get(issue.course) || { issues: [], criticalCount: 0, warningCount: 0 }
    group.issues.push(issue)
    if (issue.severity === 'critical') {
      group.criticalCount++
    } else {
      group.warningCount++
    }
    map.set(issue.course, group)
  })

  const sortedEntries = [...map.entries()].sort((a, b) => {
    if (b[1].criticalCount !== a[1].criticalCount) return b[1].criticalCount - a[1].criticalCount
    return b[1].issues.length - a[1].issues.length
  })

  return Object.fromEntries(sortedEntries) as Record<string, CourseIssueGroup>
})

function handleNavigate(itemId: string, course?: string) {
  emit('navigate', itemId, course)
}

function handleFilterByCourse(course: string) {
  emit('filterByCourse', course)
}
</script>
