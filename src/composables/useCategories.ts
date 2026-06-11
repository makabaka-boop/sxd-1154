import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import type { Category } from '@/types'
import { DEFAULT_CATEGORIES, generateId } from '@/types'
import { useAuditLog } from './useAuditLog'

const categories = useLocalStorage<Category[]>('course-prep-categories', DEFAULT_CATEGORIES)

export function useCategories() {
  const { addLog } = useAuditLog()

  const sortedCategories = computed(() =>
    [...categories.value].sort((a, b) => a.sortOrder - b.sortOrder)
  )

  function addCategory(name: string, color: string) {
    const maxSort = categories.value.reduce((max, c) => Math.max(max, c.sortOrder), -1)
    const newCat: Category = {
      id: generateId(),
      name,
      color,
      sortOrder: maxSort + 1,
    }
    categories.value.push(newCat)
    addLog('create', 'category', newCat.id, `创建分类「${name}」`)
  }

  function updateCategory(id: string, name: string, color: string) {
    const idx = categories.value.findIndex((c) => c.id === id)
    if (idx === -1) return
    categories.value[idx] = { ...categories.value[idx], name, color }
    addLog('update', 'category', id, `更新分类「${name}」`)
  }

  function deleteCategory(id: string) {
    const cat = categories.value.find((c) => c.id === id)
    categories.value = categories.value.filter((c) => c.id !== id)
    if (cat) addLog('delete', 'category', id, `删除分类「${cat.name}」`)
  }

  function getCategoryName(id: string): string {
    return categories.value.find((c) => c.id === id)?.name ?? '未知分类'
  }

  function getCategoryColor(id: string): string {
    return categories.value.find((c) => c.id === id)?.color ?? '#6B7280'
  }

  return {
    categories,
    sortedCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryName,
    getCategoryColor,
  }
}
