import type { Item } from '@/types'
import { STATUS_LABELS } from '@/types'
import type { CourseStats } from './useCourseStats'
import { useCourseStats } from './useCourseStats'

export function useExport() {
  const { computeCourseStats, computeOverallStats } = useCourseStats()

  function exportToCSV(items: Item[], getCategoryName: (id: string) => string) {
    const courseStats = computeCourseStats(items)
    const overallStats = computeOverallStats(items)

    const summaryHeaders = [
      '课程名称', '物品总数', '已备齐数量', '待准备/需补充数量',
      '暂停使用数量', '严重缺口数量', '准备完成率', '准备状态',
    ]

    const statusLabel = (stat: CourseStats) => {
      if (stat.completionRate === 100) return '已就绪'
      if (stat.criticalGapCount > 0) return '需重点关注'
      return '准备中'
    }

    const summaryRows = courseStats.map((stat) => [
      stat.course,
      String(stat.totalCount),
      String(stat.readyCount),
      String(stat.pendingSupplementCount),
      String(stat.suspendedCount),
      String(stat.criticalGapCount),
      `${stat.completionRate}%`,
      statusLabel(stat),
    ])

    const overallRow = [
      '【整体汇总】',
      String(overallStats.totalCount),
      String(overallStats.readyCount),
      String(overallStats.pendingSupplementCount),
      String(overallStats.suspendedCount),
      String(overallStats.criticalGapCount),
      `${overallStats.completionRate}%`,
      overallStats.completionRate === 100 ? '全部就绪' : overallStats.criticalGapCount > 0 ? '存在严重缺口' : '准备中',
    ]

    const itemHeaders = [
      '物品名称', '分类', '适用课程', '数量', '最低数量', '存放位置',
      '责任人', '准备状态', '缺口等级', '备注',
    ]

    const itemRows = items.map((item) => [
      item.name,
      getCategoryName(item.categoryId),
      item.course,
      String(item.quantity),
      String(item.minQuantity),
      item.location,
      item.responsible || '未指定',
      STATUS_LABELS[item.status],
      item.gapLevel === 'critical' ? '严重' : item.gapLevel === 'warning' ? '警告' : '无',
      item.notes,
    ])

    const escapeCell = (cell: string) => {
      const escaped = String(cell).replace(/"/g, '""')
      return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped
    }

    const csvLines: string[] = []

    csvLines.push('=== 课程准备总览 ===')
    csvLines.push(summaryHeaders.map(escapeCell).join(','))
    summaryRows.forEach((row) => csvLines.push(row.map(escapeCell).join(',')))
    csvLines.push(overallRow.map(escapeCell).join(','))
    csvLines.push('')

    csvLines.push('=== 物品明细清单 ===')
    csvLines.push(itemHeaders.map(escapeCell).join(','))
    itemRows.forEach((row) => csvLines.push(row.map(escapeCell).join(',')))

    const csvContent = csvLines.join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `课程物品准备清单_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return { exportToCSV }
}
