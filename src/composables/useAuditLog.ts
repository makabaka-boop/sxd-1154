import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import type { AuditLogEntry, UserRole } from '@/types'
import { generateId } from '@/types'

const auditLog = useLocalStorage<AuditLogEntry[]>('course-prep-audit-log', [])

function addLog(
  action: AuditLogEntry['action'],
  itemType: AuditLogEntry['itemType'],
  itemId: string,
  detail: string,
  operator?: string,
  role?: UserRole
) {
  auditLog.value.unshift({
    id: generateId(),
    action,
    itemType,
    itemId,
    detail,
    operator: operator || '当前用户',
    role: role || 'admin',
    timestamp: new Date().toISOString(),
  })
}

const sortedLog = computed(() => auditLog.value)

export function useAuditLog() {
  return { auditLog, sortedLog, addLog }
}
