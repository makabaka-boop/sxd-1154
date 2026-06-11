import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'
import type { ItemTemplate, TemplateItem, Item, UserRole } from '@/types'
import { generateId } from '@/types'
import { useItems } from './useItems'
import { useAuditLog } from './useAuditLog'

const templates = useLocalStorage<ItemTemplate[]>('course-prep-templates', [])

export function useTemplates() {
  const { items, addItem } = useItems()
  const { addLog } = useAuditLog()

  const sortedTemplates = computed(() =>
    [...templates.value].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  )

  function getCourseItems(course: string): Item[] {
    return items.value.filter((i) => i.course === course)
  }

  function createTemplate(
    name: string,
    sourceCourse: string,
    description: string,
    itemIndices?: number[],
    operator?: string,
    role?: UserRole
  ): ItemTemplate | null {
    const courseItems = getCourseItems(sourceCourse)
    if (courseItems.length === 0) return null

    let selectedItems = courseItems
    if (itemIndices && itemIndices.length > 0) {
      selectedItems = itemIndices
        .map((idx) => courseItems[idx])
        .filter(Boolean)
    }

    const templateItems: TemplateItem[] = selectedItems.map((item) => ({
      name: item.name,
      categoryId: item.categoryId,
      minQuantity: item.minQuantity,
      location: item.location,
      responsible: item.responsible,
      notes: item.notes,
    }))

    const now = new Date().toISOString()
    const newTemplate: ItemTemplate = {
      id: generateId(),
      name: name.trim(),
      sourceCourse,
      description: description.trim(),
      items: templateItems,
      createdAt: now,
      updatedAt: now,
    }

    templates.value.push(newTemplate)
    addLog(
      'create_template',
      'template',
      newTemplate.id,
      `创建模板「${newTemplate.name}」，来源课程「${sourceCourse}」，共${templateItems.length}项物品`,
      operator,
      role
    )
    return newTemplate
  }

  function deleteTemplate(id: string, operator?: string, role?: UserRole) {
    const template = templates.value.find((t) => t.id === id)
    templates.value = templates.value.filter((t) => t.id !== id)
    if (template) {
      addLog(
        'delete_template',
        'template',
        id,
        `删除模板「${template.name}」`,
        operator,
        role
      )
    }
  }

  function applyTemplate(
    templateId: string,
    targetCourse: string,
    selectedIndices: number[],
    responsibleOverride?: string,
    operator?: string,
    role?: UserRole
  ): Item[] {
    const template = templates.value.find((t) => t.id === templateId)
    if (!template) return []

    const createdItems: Item[] = []
    const now = new Date().toISOString()

    selectedIndices.forEach((idx) => {
      const tplItem = template.items[idx]
      if (!tplItem) return

      const responsible = responsibleOverride?.trim() || tplItem.responsible
      const newItem = addItem(
        {
          name: tplItem.name,
          categoryId: tplItem.categoryId,
          course: targetCourse.trim(),
          quantity: 0,
          minQuantity: tplItem.minQuantity,
          location: tplItem.location,
          responsible,
          status: 'pending',
          notes: tplItem.notes,
        },
        operator,
        role
      )
      createdItems.push(newItem)
    })

    if (createdItems.length > 0) {
      addLog(
        'apply_template',
        'template',
        templateId,
        `应用模板「${template.name}」到课程「${targetCourse}」，生成${createdItems.length}项物品`,
        operator,
        role
      )
    }

    return createdItems
  }

  function updateTemplate(
    id: string,
    data: Partial<Pick<ItemTemplate, 'name' | 'description'>>,
    operator?: string,
    role?: UserRole
  ) {
    const idx = templates.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    const oldName = templates.value[idx].name
    templates.value[idx] = {
      ...templates.value[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    addLog(
      'update',
      'template',
      id,
      `更新模板「${oldName}」`,
      operator,
      role
    )
  }

  return {
    templates,
    sortedTemplates,
    createTemplate,
    deleteTemplate,
    applyTemplate,
    updateTemplate,
    getCourseItems,
  }
}
