import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import type { Item, ItemStatus, GapLevel, UserRole } from '@/types'
import { DEFAULT_ITEMS, generateId, STATUS_LABELS } from '@/types'
import { useAuditLog } from './useAuditLog'

const items = useLocalStorage<Item[]>('course-prep-items', DEFAULT_ITEMS)
const draft = useLocalStorage<Partial<Item> | null>('course-prep-draft', null)

export function useItems() {
  const { addLog } = useAuditLog()

  function computeGapLevel(item: Item): GapLevel {
    if (item.quantity < item.minQuantity) return 'critical'
    if (!item.responsible.trim()) return 'critical'
    return 'none'
  }

  function checkDuplicate(item: Item): boolean {
    return items.value.some(
      (i) =>
        i.id !== item.id &&
        i.name === item.name &&
        i.course === item.course
    )
  }

  function getCourseGapCount(course: string): number {
    return items.value.filter(
      (i) => i.course === course && computeGapLevel(i) === 'critical'
    ).length
  }

  function addItem(data: Omit<Item, 'id' | 'gapLevel' | 'createdAt' | 'updatedAt'>, operator?: string, role?: UserRole) {
    const now = new Date().toISOString()
    const newItem: Item = {
      ...data,
      id: generateId(),
      gapLevel: 'none',
      createdAt: now,
      updatedAt: now,
    }
    newItem.gapLevel = computeGapLevel(newItem)
    items.value.push(newItem)
    addLog('create', 'item', newItem.id, `创建物品「${newItem.name}」`, operator, role)
    return newItem
  }

  function updateItem(id: string, data: Partial<Item>, operator?: string, role?: UserRole) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx === -1) return
    const updated = { ...items.value[idx], ...data, updatedAt: new Date().toISOString() }
    updated.gapLevel = computeGapLevel(updated)
    items.value[idx] = updated
    const changes = Object.keys(data)
      .filter((k) => k !== 'updatedAt' && k !== 'gapLevel')
      .map((k) => `${k}: ${(data as Record<string, unknown>)[k]}`)
      .join(', ')
    addLog('update', 'item', id, `更新物品「${updated.name}」: ${changes}`, operator, role)
  }

  function deleteItem(id: string, operator?: string, role?: UserRole) {
    const item = items.value.find((i) => i.id === id)
    items.value = items.value.filter((i) => i.id !== id)
    if (item) addLog('delete', 'item', id, `删除物品「${item.name}」`, operator, role)
  }

  function batchUpdateStatus(ids: string[], status: ItemStatus, operator?: string, role?: UserRole) {
    const label = STATUS_LABELS[status]
    ids.forEach((id) => {
      const idx = items.value.findIndex((i) => i.id === id)
      if (idx === -1) return
      items.value[idx] = {
        ...items.value[idx],
        status,
        updatedAt: new Date().toISOString(),
      }
    })
    addLog('batch_status', 'item', ids.join(','), `批量标记${label}，共${ids.length}项`, operator, role)
  }

  function saveDraft(data: Partial<Item>) {
    draft.value = data
  }

  function clearDraft() {
    draft.value = null
  }

  const allCourses = computed(() =>
    [...new Set(items.value.map((i) => i.course))].sort()
  )

  const allResponsibles = computed(() =>
    [...new Set(items.value.map((i) => i.responsible).filter(Boolean))].sort()
  )

  return {
    items,
    draft,
    addItem,
    updateItem,
    deleteItem,
    batchUpdateStatus,
    computeGapLevel,
    checkDuplicate,
    getCourseGapCount,
    saveDraft,
    clearDraft,
    allCourses,
    allResponsibles,
  }
}
