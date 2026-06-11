import type { Item } from '@/types'

export interface CourseStats {
  course: string
  totalCount: number
  readyCount: number
  pendingSupplementCount: number
  suspendedCount: number
  criticalGapCount: number
  completionRate: number
}

export function useCourseStats() {
  function computeCourseStats(items: Item[]): CourseStats[] {
    const courseMap = new Map<string, Item[]>()

    items.forEach((item) => {
      const arr = courseMap.get(item.course) || []
      arr.push(item)
      courseMap.set(item.course, arr)
    })

    const result: CourseStats[] = []

    courseMap.forEach((courseItems, course) => {
      const totalCount = courseItems.length
      const readyCount = courseItems.filter((i) => i.status === 'ready').length
      const pendingSupplementCount = courseItems.filter(
        (i) => i.status === 'pending' || i.status === 'supplement'
      ).length
      const suspendedCount = courseItems.filter((i) => i.status === 'suspended').length
      const criticalGapCount = courseItems.filter((i) => i.gapLevel === 'critical').length
      const completionRate = totalCount === 0 ? 0 : Math.round((readyCount / totalCount) * 100)

      result.push({
        course,
        totalCount,
        readyCount,
        pendingSupplementCount,
        suspendedCount,
        criticalGapCount,
        completionRate,
      })
    })

    result.sort((a, b) => {
      if (a.criticalGapCount !== b.criticalGapCount) return b.criticalGapCount - a.criticalGapCount
      if (a.completionRate !== b.completionRate) return a.completionRate - b.completionRate
      return a.course.localeCompare(b.course)
    })

    return result
  }

  function computeOverallStats(items: Item[]) {
    const totalCount = items.length
    const readyCount = items.filter((i) => i.status === 'ready').length
    const pendingSupplementCount = items.filter(
      (i) => i.status === 'pending' || i.status === 'supplement'
    ).length
    const suspendedCount = items.filter((i) => i.status === 'suspended').length
    const criticalGapCount = items.filter((i) => i.gapLevel === 'critical').length
    const completionRate = totalCount === 0 ? 0 : Math.round((readyCount / totalCount) * 100)

    return {
      totalCount,
      readyCount,
      pendingSupplementCount,
      suspendedCount,
      criticalGapCount,
      completionRate,
    }
  }

  return {
    computeCourseStats,
    computeOverallStats,
  }
}
