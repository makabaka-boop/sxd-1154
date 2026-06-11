import { ref, computed } from 'vue'
import type { Item } from '@/types'

const checkMode = ref(false)

export function useCheckMode() {
  function toggleCheckMode() {
    checkMode.value = !checkMode.value
  }

  function filterForCheckMode(items: Item[]): Item[] {
    if (!checkMode.value) return items
    return items.filter(
      (item) =>
        item.status === 'pending' ||
        item.status === 'supplement' ||
        item.gapLevel === 'critical' ||
        item.gapLevel === 'warning'
    )
  }

  const isCheckMode = computed(() => checkMode.value)

  return {
    checkMode,
    isCheckMode,
    toggleCheckMode,
    filterForCheckMode,
  }
}
