export type ItemStatus = 'pending' | 'ready' | 'supplement' | 'suspended'
export type GapLevel = 'none' | 'warning' | 'critical'
export type UserRole = 'admin' | 'user' | 'auditor'

export interface Category {
  id: string
  name: string
  color: string
  sortOrder: number
}

export interface Item {
  id: string
  name: string
  categoryId: string
  course: string
  quantity: number
  minQuantity: number
  location: string
  responsible: string
  status: ItemStatus
  notes: string
  gapLevel: GapLevel
  createdAt: string
  updatedAt: string
}

export interface AuditLogEntry {
  id: string
  action: 'create' | 'update' | 'delete' | 'batch_status'
  itemType: 'item' | 'category'
  itemId: string
  detail: string
  operator: string
  role: UserRole
  timestamp: string
}

export interface FilterState {
  course: string
  category: string
  responsible: string
  status: string
  gapLevel: string
}

export const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '待准备',
  ready: '已备齐',
  supplement: '需补充',
  suspended: '暂停使用',
}

export const GAP_LABELS: Record<GapLevel, string> = {
  none: '无缺口',
  warning: '警告',
  critical: '严重',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理员',
  user: '普通用户',
  auditor: '审计员',
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-signin', name: '签到用品', color: '#0F766E', sortOrder: 0 },
  { id: 'cat-material', name: '练习材料', color: '#7C3AED', sortOrder: 1 },
  { id: 'cat-timer', name: '计时器', color: '#2563EB', sortOrder: 2 },
  { id: 'cat-badge', name: '桌签', color: '#D97706', sortOrder: 3 },
  { id: 'cat-backup', name: '备用设备', color: '#DC2626', sortOrder: 4 },
]

export const DEFAULT_ITEMS: Item[] = [
  {
    id: 'item-1', name: '签到表', categoryId: 'cat-signin', course: '新员工入职培训',
    quantity: 30, minQuantity: 25, location: 'A区储物柜', responsible: '张老师',
    status: 'ready', notes: '', gapLevel: 'none',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-2', name: '签到笔', categoryId: 'cat-signin', course: '新员工入职培训',
    quantity: 20, minQuantity: 30, location: 'A区储物柜', responsible: '张老师',
    status: 'supplement', notes: '缺10支', gapLevel: 'critical',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-3', name: '练习手册', categoryId: 'cat-material', course: '销售技巧培训',
    quantity: 25, minQuantity: 25, location: 'B区档案室', responsible: '李老师',
    status: 'ready', notes: '', gapLevel: 'none',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-4', name: '电子计时器', categoryId: 'cat-timer', course: '演讲培训',
    quantity: 2, minQuantity: 3, location: 'C区设备间', responsible: '',
    status: 'pending', notes: '需确认设备是否可用', gapLevel: 'critical',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-5', name: '学员桌签', categoryId: 'cat-badge', course: '销售技巧培训',
    quantity: 15, minQuantity: 20, location: 'D区打印室', responsible: '王老师',
    status: 'supplement', notes: '缺5个', gapLevel: 'critical',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-6', name: '备用投影仪', categoryId: 'cat-backup', course: '新员工入职培训',
    quantity: 1, minQuantity: 1, location: 'C区设备间', responsible: '赵老师',
    status: 'ready', notes: '', gapLevel: 'none',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-7', name: '笔记本电脑', categoryId: 'cat-backup', course: '演讲培训',
    quantity: 0, minQuantity: 2, location: 'C区设备间', responsible: '',
    status: 'pending', notes: '需紧急调配', gapLevel: 'critical',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-8', name: '练习手册', categoryId: 'cat-material', course: '演讲培训',
    quantity: 10, minQuantity: 15, location: 'B区档案室', responsible: '李老师',
    status: 'supplement', notes: '差5本', gapLevel: 'critical',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
]

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
