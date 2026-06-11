<template>
  <div class="h-full flex flex-col bg-white border-l border-zinc-200">
    <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
      <h3 class="text-sm font-semibold text-zinc-700">
        {{ isNew ? '新增物品' : '物品详情' }}
        <span v-if="isNew && hasDraft" class="ml-2 text-xs text-amber-600 font-normal">
          (已有草稿)
        </span>
      </h3>
      <div class="flex items-center gap-2">
        <button
          v-if="canDelete && !isNew"
          @click="$emit('delete', item!.id)"
          class="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
        >
          <Trash2 class="w-4 h-4" />
        </button>
        <button
          @click="$emit('close')"
          class="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="clearedNotice" class="px-5 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-700">
      {{ clearedNotice }}
    </div>

    <div v-if="item || isNew" class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
      <div>
        <label class="field-label">物品名称 *</label>
        <input v-model="form.name" class="field-input" placeholder="输入物品名称" :disabled="!canEdit" />
      </div>

      <div>
        <label class="field-label">分类 *</label>
        <select v-model="form.categoryId" class="field-input" :disabled="!canEdit">
          <option value="">请选择分类</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div>
        <label class="field-label">适用课程 *</label>
        <input v-model="form.course" class="field-input" placeholder="输入课程名称" :disabled="!canEdit" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="field-label">数量</label>
          <input v-model.number="form.quantity" type="number" min="0" class="field-input" :disabled="!canEdit" />
        </div>
        <div>
          <label class="field-label">最低数量</label>
          <input v-model.number="form.minQuantity" type="number" min="0" class="field-input" :disabled="!canEdit" />
        </div>
      </div>

      <div>
        <label class="field-label">存放位置</label>
        <input v-model="form.location" class="field-input" placeholder="输入存放位置" :disabled="!canEdit" />
      </div>

      <div>
        <label class="field-label">责任人</label>
        <input v-model="form.responsible" class="field-input" placeholder="输入责任人" :disabled="!canEdit" />
      </div>

      <div>
        <label class="field-label">准备状态</label>
        <select v-model="form.status" class="field-input" :disabled="!canEdit">
          <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <div>
        <label class="field-label">备注</label>
        <textarea v-model="form.notes" class="field-input" rows="3" placeholder="输入备注信息" :disabled="!canEdit" />
      </div>

      <div v-if="duplicateWarning" class="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
        <AlertTriangle class="w-4 h-4 mt-0.5 flex-shrink-0" />
        {{ duplicateWarning }}
      </div>

      <div v-if="gapWarning" class="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
        <AlertTriangle class="w-4 h-4 mt-0.5 flex-shrink-0" />
        {{ gapWarning }}
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-zinc-400">
      <div class="text-center">
        <Package class="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p class="text-sm">选择物品查看详情</p>
      </div>
    </div>

    <div v-if="(item || isNew) && canEdit" class="px-5 py-4 border-t border-zinc-100 flex gap-3">
      <button @click="handleClearDraft" v-if="isNew && hasDraft" class="btn-secondary flex-1">
        清除草稿
      </button>
      <button @click="$emit('close')" class="btn-secondary flex-1">取消</button>
      <button @click="handleSave" class="btn-primary flex-1" :disabled="!isFormValid">
        {{ isNew ? '创建' : '保存' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { X, Trash2, AlertTriangle, Package } from 'lucide-vue-next'
import type { Item, ItemStatus, Category } from '@/types'
import { STATUS_LABELS } from '@/types'

const DRAFT_KEY = 'course-prep-item-draft'

const props = defineProps<{
  item: Item | null
  isNew: boolean
  categories: Category[]
  canEdit: boolean
  canDelete: boolean
  clearedNotice: string
  isDuplicate: boolean
  hasGap: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<Item>]
  delete: [id: string]
}>()

const defaultForm = () => ({
  name: '',
  categoryId: '',
  course: '',
  quantity: 0,
  minQuantity: 0,
  location: '',
  responsible: '',
  status: 'pending' as ItemStatus,
  notes: '',
})

const form = reactive(defaultForm())
const hasDraft = computed(() => {
  if (!props.isNew) return false
  const draft = localStorage.getItem(DRAFT_KEY)
  return !!draft
})

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      Object.assign(form, {
        name: newItem.name,
        categoryId: newItem.categoryId,
        course: newItem.course,
        quantity: newItem.quantity,
        minQuantity: newItem.minQuantity,
        location: newItem.location,
        responsible: newItem.responsible,
        status: newItem.status,
        notes: newItem.notes,
      })
    }
  },
  { immediate: true }
)

watch(
  () => props.isNew,
  (val) => {
    if (val) {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        try {
          Object.assign(form, JSON.parse(draft))
        } catch {
          Object.assign(form, defaultForm())
        }
      } else {
        Object.assign(form, defaultForm())
      }
    }
  },
  { immediate: true }
)

let saveTimeout: number | null = null
watch(
  form,
  () => {
    if (props.isNew && props.canEdit) {
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = window.setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form }))
      }, 500)
    }
  },
  { deep: true }
)

function handleClearDraft() {
  localStorage.removeItem(DRAFT_KEY)
  Object.assign(form, defaultForm())
}

const isFormValid = computed(
  () => form.name.trim() && form.categoryId && form.course.trim()
)

const duplicateWarning = computed(() => {
  if (!props.isDuplicate) return ''
  return `课程「${form.course}」中已存在同名物品「${form.name}」`
})

const gapWarning = computed(() => {
  if (!props.hasGap && form.quantity >= form.minQuantity && form.responsible.trim()) return ''
  const msgs: string[] = []
  if (form.quantity < form.minQuantity) msgs.push(`数量(${form.quantity})低于最低数量(${form.minQuantity})`)
  if (!form.responsible.trim()) msgs.push('缺少责任人')
  return msgs.join('，')
})

function handleSave() {
  if (!isFormValid.value) return
  if (props.isNew) {
    localStorage.removeItem(DRAFT_KEY)
  }
  emit('save', { ...form })
}

onBeforeUnmount(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
})
</script>
