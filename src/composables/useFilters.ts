import { reactive, computed } from 'vue'
import type { Item, FilterState } from '@/types'

const filters = reactive<FilterState>({
  course: '',
  category: '',
  responsible: '',
  status: '',
  gapLevel: '',
})

export function useFilters() {
  function setFilter(key: keyof FilterState, value: string) {
    filters[key] = value
  }

  function resetFilters() {
    filters.course = ''
    filters.category = ''
    filters.responsible = ''
    filters.status = ''
    filters.gapLevel = ''
  }

  function filterItems(items: Item[]): Item[] {
    return items.filter((item) => {
      if (filters.course && item.course !== filters.course) return false
      if (filters.category && item.categoryId !== filters.category) return false
      if (filters.responsible && item.responsible !== filters.responsible) return false
      if (filters.status && item.status !== filters.status) return false
      if (filters.gapLevel && item.gapLevel !== filters.gapLevel) return false
      return true
    })
  }

  const hasActiveFilters = computed(
    () =>
      filters.course !== '' ||
      filters.category !== '' ||
      filters.responsible !== '' ||
      filters.status !== '' ||
      filters.gapLevel !== ''
  )

  return {
    filters,
    setFilter,
    resetFilters,
    filterItems,
    hasActiveFilters,
  }
}
