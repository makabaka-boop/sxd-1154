import { ref, computed } from 'vue'
import type { UserRole } from '@/types'
import { useLocalStorage } from './useLocalStorage'

const currentRole = useLocalStorage<UserRole>('course-prep-role', 'admin')

export function useRole() {
  function setRole(role: UserRole) {
    currentRole.value = role
  }

  const isAdmin = computed(() => currentRole.value === 'admin')
  const isUser = computed(() => currentRole.value === 'user')
  const isAuditor = computed(() => currentRole.value === 'auditor')
  const canEdit = computed(() => isAdmin.value || isUser.value)
  const canDelete = computed(() => isAdmin.value)
  const canManageCategories = computed(() => isAdmin.value)
  const canViewAudit = computed(() => isAdmin.value || isAuditor.value)
  const canExport = computed(() => true)

  return {
    currentRole,
    setRole,
    isAdmin,
    isUser,
    isAuditor,
    canEdit,
    canDelete,
    canManageCategories,
    canViewAudit,
    canExport,
  }
}
