import { computed } from 'vue'
import type { Item } from '@/types'

export interface CheckIssue {
  type: 'low_quantity' | 'no_responsible' | 'duplicate' | 'course_gap'
  severity: 'critical' | 'warning'
  itemId: string
  itemName: string
  course: string
  message: string
}

export function useAutoCheck() {
  function runChecks(items: Item[]): CheckIssue[] {
    const issues: CheckIssue[] = []

    items.forEach((item) => {
      if (item.quantity < item.minQuantity) {
        issues.push({
          type: 'low_quantity',
          severity: 'critical',
          itemId: item.id,
          itemName: item.name,
          course: item.course,
          message: `「${item.name}」数量(${item.quantity})低于最低数量(${item.minQuantity})`,
        })
      }

      if (!item.responsible.trim()) {
        issues.push({
          type: 'no_responsible',
          severity: 'critical',
          itemId: item.id,
          itemName: item.name,
          course: item.course,
          message: `「${item.name}」缺少责任人`,
        })
      }
    })

    const nameCourseMap = new Map<string, Item[]>()
    items.forEach((item) => {
      const key = `${item.name}||${item.course}`
      const arr = nameCourseMap.get(key) || []
      arr.push(item)
      nameCourseMap.set(key, arr)
    })
    nameCourseMap.forEach((group) => {
      if (group.length > 1) {
        group.forEach((item) => {
          issues.push({
            type: 'duplicate',
            severity: 'warning',
            itemId: item.id,
            itemName: item.name,
            course: item.course,
            message: `课程「${item.course}」中存在同名物品「${item.name}」`,
          })
        })
      }
    })

    const courseGapMap = new Map<string, number>()
    items.forEach((item) => {
      if (item.quantity < item.minQuantity || !item.responsible.trim()) {
        courseGapMap.set(item.course, (courseGapMap.get(item.course) || 0) + 1)
      }
    })
    courseGapMap.forEach((count, course) => {
      if (count >= 3) {
        issues.push({
          type: 'course_gap',
          severity: 'critical',
          itemId: '',
          itemName: '',
          course,
          message: `课程「${course}」存在${count}个缺口项，需重点关注`,
        })
      }
    })

    return issues
  }

  function getIssueSummary(items: Item[]) {
    const issues = runChecks(items)
    const critical = issues.filter((i) => i.severity === 'critical')
    const warning = issues.filter((i) => i.severity === 'warning')
    return { issues, criticalCount: critical.length, warningCount: warning.length }
  }

  return { runChecks, getIssueSummary }
}
