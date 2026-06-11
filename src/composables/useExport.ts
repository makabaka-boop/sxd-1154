import type { Item } from '@/types'
import { STATUS_LABELS } from '@/types'

export function useExport() {
  function exportToCSV(items: Item[], getCategoryName: (id: string) => string) {
    const headers = [
      '物品名称', '分类', '适用课程', '数量', '最低数量', '存放位置',
      '责任人', '准备状态', '缺口等级', '备注',
    ]
    const rows = items.map((item) => [
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

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          const escaped = String(cell).replace(/"/g, '""')
          return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped
        }).join(',')
      ),
    ].join('\n')

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
