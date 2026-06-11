<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div class="flex items-center gap-2">
            <Layers class="w-4 h-4 text-teal-700" />
            <h3 class="font-semibold text-zinc-800">从模板生成课程物品清单</h3>
          </div>
          <button @click="$emit('close')" class="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div v-if="step === 1">
            <div class="space-y-3">
              <div
                v-for="tpl in sortedTemplates"
                :key="tpl.id"
                @click="selectTemplate(tpl.id)"
                :class="[
                  'p-4 rounded-lg border-2 cursor-pointer transition-all',
                  selectedTemplateId === tpl.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50',
                ]"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-sm font-semibold text-zinc-800">{{ tpl.name }}</h4>
                      <span class="text-xs text-zinc-400">{{ tpl.items.length }} 项物品</span>
                    </div>
                    <p v-if="tpl.description" class="text-xs text-zinc-500 mb-1">{{ tpl.description }}</p>
                    <p class="text-xs text-zinc-400">
                      来源课程：{{ tpl.sourceCourse }} · {{ formatDate(tpl.updatedAt) }}
                    </p>
                  </div>
                  <button
                    v-if="canManageTemplates"
                    @click.stop="handleDeleteTemplate(tpl.id, tpl.name)"
                    class="p-1 text-zinc-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                    type="button"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div v-if="sortedTemplates.length === 0" class="text-center py-12 text-zinc-400">
                <Layers class="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p class="text-sm">暂无模板，请先从已有课程保存为模板</p>
              </div>
            </div>
          </div>

          <div v-if="step === 2 && selectedTemplate">
            <button
              @click="step = 1"
              class="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-3"
              type="button"
            >
              <ChevronLeft class="w-4 h-4" />
              返回选择模板
            </button>

            <div class="bg-teal-50 border border-teal-100 rounded-lg p-3 mb-4">
              <div class="flex items-start gap-2">
                <Info class="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <div class="text-xs text-teal-700">
                  已选择模板「<strong>{{ selectedTemplate.name }}</strong>」。请确认生成参数，勾选需要带入的物品，并可调整课程名称和责任人。
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label class="field-label">目标课程名称 *</label>
                <input v-model="targetCourse" class="field-input" placeholder="输入新课程名称" />
              </div>
              <div>
                <label class="field-label">
                  统一责任人
                  <span class="text-zinc-400 font-normal ml-1">(留空则使用模板中各物品的默认责任人)</span>
                </label>
                <input v-model="responsibleOverride" class="field-input" placeholder="输入统一责任人（可选）" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="field-label !mb-0">选择要带入的物品（{{ selectedIndices.length }}/{{ selectedTemplate.items.length }}）</label>
                <div class="flex items-center gap-2">
                  <button
                    @click="selectAllItems"
                    class="text-xs text-teal-600 hover:text-teal-700"
                    type="button"
                  >
                    全选
                  </button>
                  <span class="text-xs text-zinc-300">|</span>
                  <button
                    @click="deselectAllItems"
                    class="text-xs text-zinc-500 hover:text-zinc-700"
                    type="button"
                  >
                    取消全选
                  </button>
                </div>
              </div>
              <div class="border border-zinc-200 rounded-lg overflow-hidden">
                <div
                  v-for="(tplItem, idx) in selectedTemplate.items"
                  :key="idx"
                  class="flex items-center gap-3 px-3 py-2.5 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="idx"
                    v-model="selectedIndices"
                    class="w-4 h-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: getCategoryColor(tplItem.categoryId) }"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-zinc-800 truncate">{{ tplItem.name }}</div>
                    <div class="text-xs text-zinc-500 truncate">
                      {{ getCategoryName(tplItem.categoryId) }}
                      <span v-if="tplItem.responsible"> · {{ tplItem.responsible }}</span>
                      <span v-if="tplItem.minQuantity > 0"> · 最低{{ tplItem.minQuantity }}件</span>
                      <span v-if="tplItem.location"> · {{ tplItem.location }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-zinc-100 flex gap-3">
          <button @click="$emit('close')" class="btn-secondary flex-1">取消</button>
          <template v-if="step === 1">
            <button
              @click="step = 2"
              class="btn-primary flex-1"
              :disabled="!selectedTemplateId"
            >
              下一步：预览并调整
            </button>
          </template>
          <template v-else>
            <button @click="step = 1" class="btn-secondary flex-1">上一步</button>
            <button
              @click="handleApply"
              class="btn-primary flex-1"
              :disabled="!canApply"
            >
              生成物品清单
            </button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Layers, ChevronLeft, Info, Trash2 } from 'lucide-vue-next'
import type { ItemTemplate, Category } from '@/types'

const props = defineProps<{
  show: boolean
  sortedTemplates: ItemTemplate[]
  categories: Category[]
  canManageTemplates: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [templateId: string, targetCourse: string, selectedIndices: number[], responsibleOverride: string]
  deleteTemplate: [id: string]
}>()

const step = ref(1)
const selectedTemplateId = ref('')
const targetCourse = ref('')
const responsibleOverride = ref('')
const selectedIndices = ref<number[]>([])

watch(
  () => props.show,
  (val) => {
    if (val) {
      step.value = 1
      selectedTemplateId.value = ''
      targetCourse.value = ''
      responsibleOverride.value = ''
      selectedIndices.value = []
    }
  }
)

watch(
  selectedTemplateId,
  (val) => {
    if (val) {
      const tpl = props.sortedTemplates.find((t) => t.id === val)
      if (tpl) {
        selectedIndices.value = tpl.items.map((_, idx) => idx)
        targetCourse.value = ''
      }
    }
  }
)

const selectedTemplate = computed(() =>
  props.sortedTemplates.find((t) => t.id === selectedTemplateId.value)
)

function selectTemplate(id: string) {
  selectedTemplateId.value = id
}

function getCategoryName(categoryId: string): string {
  return props.categories.find((c) => c.id === categoryId)?.name || '未分类'
}

function getCategoryColor(categoryId: string): string {
  return props.categories.find((c) => c.id === categoryId)?.color || '#71717a'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function selectAllItems() {
  if (selectedTemplate.value) {
    selectedIndices.value = selectedTemplate.value.items.map((_, idx) => idx)
  }
}

function deselectAllItems() {
  selectedIndices.value = []
}

function handleDeleteTemplate(id: string, name: string) {
  if (confirm(`确定要删除模板「${name}」吗？`)) {
    emit('deleteTemplate', id)
    if (selectedTemplateId.value === id) {
      selectedTemplateId.value = ''
    }
  }
}

const canApply = computed(
  () =>
    targetCourse.value.trim() &&
    selectedIndices.value.length > 0
)

function handleApply() {
  if (!canApply.value || !selectedTemplateId.value) return
  emit('apply', selectedTemplateId.value, targetCourse.value.trim(), selectedIndices.value, responsibleOverride.value)
}
</script>
