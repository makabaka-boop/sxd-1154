<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl border border-zinc-200 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <LayoutDashboard class="w-4.5 h-4.5 text-teal-700" />
          <h2 class="text-sm font-semibold text-zinc-800">课程准备总览</h2>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-teal-500" />
            <span class="text-zinc-500">已备齐</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-amber-500" />
            <span class="text-zinc-500">待准备/需补充</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-red-500" />
            <span class="text-zinc-500">严重缺口</span>
          </div>
        </div>
      </div>

      <div class="bg-zinc-50 rounded-lg p-3 mb-4 flex items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-700/10 flex items-center justify-center">
            <BookOpen class="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <div class="text-xs text-zinc-500">课程总数</div>
            <div class="text-lg font-bold text-zinc-800">{{ courseStats.length }}</div>
          </div>
        </div>
        <div class="w-px h-10 bg-zinc-200" />
        <div>
          <div class="text-xs text-zinc-500">物品总数</div>
          <div class="text-lg font-bold text-zinc-800">{{ overallStats.totalCount }}</div>
        </div>
        <div>
          <div class="text-xs text-zinc-500">已备齐</div>
          <div class="text-lg font-bold text-teal-600">{{ overallStats.readyCount }}</div>
        </div>
        <div>
          <div class="text-xs text-zinc-500">待准备/需补充</div>
          <div class="text-lg font-bold text-amber-600">{{ overallStats.pendingSupplementCount }}</div>
        </div>
        <div>
          <div class="text-xs text-zinc-500">严重缺口</div>
          <div class="text-lg font-bold text-red-600">{{ overallStats.criticalGapCount }}</div>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-zinc-500">整体完成率</span>
            <span class="text-sm font-semibold text-zinc-800">{{ overallStats.completionRate }}%</span>
          </div>
          <div class="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
              :style="{ width: overallStats.completionRate + '%' }"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="stat in courseStats"
          :key="stat.course"
          @click="handleSelectCourse(stat.course)"
          :class="[
            'relative rounded-lg border p-3 cursor-pointer transition-all duration-200',
            selectedCourse === stat.course
              ? 'border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-500/20'
              : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm bg-white',
          ]"
        >
          <div class="flex items-start justify-between mb-2.5">
            <h3 class="text-sm font-semibold text-zinc-800 leading-snug pr-4">{{ stat.course }}</h3>
            <button
              v-if="selectedCourse === stat.course"
              @click.stop="handleClearCourse"
              class="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded -mr-1 -mt-1 transition-colors"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="flex items-center gap-2 mb-2">
            <span
              :class="[
                'text-xs font-medium px-2 py-0.5 rounded-full',
                stat.completionRate === 100
                  ? 'bg-teal-100 text-teal-700'
                  : stat.criticalGapCount > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700',
              ]"
            >
              {{ stat.completionRate === 100 ? '已就绪' : stat.criticalGapCount > 0 ? '需重点关注' : '准备中' }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 mb-3">
            <div class="text-center">
              <div class="text-base font-bold text-zinc-800">{{ stat.totalCount }}</div>
              <div class="text-[10px] text-zinc-500">总数</div>
            </div>
            <div class="text-center">
              <div class="text-base font-bold text-teal-600">{{ stat.readyCount }}</div>
              <div class="text-[10px] text-zinc-500">已备齐</div>
            </div>
            <div class="text-center">
              <div class="text-base font-bold text-amber-600">{{ stat.pendingSupplementCount }}</div>
              <div class="text-[10px] text-zinc-500">待准备</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-zinc-500">完成率</span>
                <span class="text-xs font-semibold text-zinc-700">{{ stat.completionRate }}%</span>
              </div>
              <div class="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    stat.completionRate === 100
                      ? 'bg-teal-500'
                      : stat.criticalGapCount > 0
                      ? 'bg-red-400'
                      : 'bg-amber-400',
                  ]"
                  :style="{ width: stat.completionRate + '%' }"
                />
              </div>
            </div>
            <div
              v-if="stat.criticalGapCount > 0"
              class="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full"
            >
              <AlertTriangle class="w-3 h-3 text-red-500" />
              <span class="text-xs font-semibold text-red-600">{{ stat.criticalGapCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, BookOpen, AlertTriangle, LayoutDashboard } from 'lucide-vue-next'
import type { CourseStats } from '@/composables/useCourseStats'

defineProps<{
  courseStats: CourseStats[]
  overallStats: {
    totalCount: number
    readyCount: number
    pendingSupplementCount: number
    criticalGapCount: number
    completionRate: number
  }
  selectedCourse: string
}>()

const emit = defineEmits<{
  selectCourse: [course: string]
  clearCourse: []
}>()

function handleSelectCourse(course: string) {
  emit('selectCourse', course)
}

function handleClearCourse() {
  emit('clearCourse')
}
</script>
