<template>
  <div class="flex flex-wrap items-center gap-3">
    <select
      :value="filters.course"
      @change="emit('setFilter', 'course', ($event.target as HTMLSelectElement).value)"
      class="filter-select"
    >
      <option value="">全部课程</option>
      <option v-for="c in courses" :key="c" :value="c">{{ c }}</option>
    </select>

    <select
      :value="filters.category"
      @change="emit('setFilter', 'category', ($event.target as HTMLSelectElement).value)"
      class="filter-select"
    >
      <option value="">全部分类</option>
      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
    </select>

    <select
      :value="filters.responsible"
      @change="emit('setFilter', 'responsible', ($event.target as HTMLSelectElement).value)"
      class="filter-select"
    >
      <option value="">全部责任人</option>
      <option v-for="r in responsibles" :key="r" :value="r">{{ r }}</option>
    </select>

    <select
      :value="filters.status"
      @change="emit('setFilter', 'status', ($event.target as HTMLSelectElement).value)"
      class="filter-select"
    >
      <option value="">全部状态</option>
      <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
    </select>

    <select
      :value="filters.gapLevel"
      @change="emit('setFilter', 'gapLevel', ($event.target as HTMLSelectElement).value)"
      class="filter-select"
    >
      <option value="">全部缺口</option>
      <option value="critical">严重</option>
      <option value="warning">警告</option>
      <option value="none">无缺口</option>
    </select>

    <button
      v-if="hasActiveFilters"
      @click="emit('resetFilters')"
      class="text-sm text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-1"
    >
      <X class="w-3.5 h-3.5" />
      清除筛选
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Category, FilterState } from '@/types'
import { STATUS_LABELS } from '@/types'

defineProps<{
  filters: FilterState
  courses: string[]
  categories: Category[]
  responsibles: string[]
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  setFilter: [key: keyof FilterState, value: string]
  resetFilters: []
}>()
</script>
