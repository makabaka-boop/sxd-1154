<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div class="flex items-center gap-2">
            <Save class="w-4 h-4 text-teal-700" />
            <h3 class="font-semibold text-zinc-800">保存为课程模板</h3>
          </div>
          <button @click="$emit('close')" class="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div class="bg-teal-50 border border-teal-100 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <Info class="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div class="text-xs text-teal-700">
                正在将课程「<strong>{{ sourceCourse }}</strong>」的物品清单保存为模板。模板将保留物品名称、分类、最低数量、默认存放位置、默认责任人和备注信息。
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="field-label">模板名称 *</label>
              <input v-model="templateName" class="field-input" :placeholder="`${sourceCourse} - 模板`" />
            </div>
            <div>
              <label class="field-label">模板描述</label>
              <textarea v-model="templateDescription" class="field-input" rows="2" placeholder="输入模板描述（可选）" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="field-label !mb-0">选择要包含的物品（{{ selectedItemIndices.length }}/{{ courseItems.length }}）</label>
              <div class="flex items-center gap-2">
                <button
                  @click="selectAll"
                  class="text-xs text-teal-600 hover:text-teal-700"
                  type="button"
                >
                  全选
                </button>
                <span class="text-xs text-zinc-300">|</span>
                <button
                  @click="deselectAll"
                  class="text-xs text-zinc-500 hover:text-zinc-700"
                  type="button"
                >
                  取消全选
                </button>
              </div>
            </div>
            <div class="border border-zinc-200 rounded-lg overflow-hidden">
              <div
                v-for="(item, idx) in courseItems"
                :key="item.id"
                class="flex items-center gap-3 px-3 py-2.5 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition-colors"
              >
                <input
                  type="checkbox"
                  :value="idx"
                  v-model="selectedItemIndices"
                  class="w-4 h-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                />
                <div
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: getCategoryColor(item.categoryId) }"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-zinc-800 truncate">{{ item.name }}</div>
                  <div class="text-xs text-zinc-500 truncate">
                    {{ getCategoryName(item.categoryId) }}
                    <span v-if="item.responsible"> · {{ item.responsible }}</span>
                    <span v-if="item.minQuantity > 0"> · 最低{{ item.minQuantity }}件</span>
                  </div>
                </div>
              </div>
              <div v-if="courseItems.length === 0" class="px-3 py-8 text-center text-zinc-400 text-sm">
                该课程暂无物品
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-zinc-100 flex gap-3">
          <button @click="$emit('close')" class="btn-secondary flex-1">取消</button>
          <button
            @click="handleSave"
            class="btn-primary flex-1"
            :disabled="!canSave"
          >
            保存模板
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Save, Info } from 'lucide-vue-next'
import type { Item, Category } from '@/types'

const props = defineProps<{
  show: boolean
  sourceCourse: string
  courseItems: Item[]
  categories: Category[]
}>()

const emit = defineEmits<{
  close: []
  save: [name: string, description: string, itemIndices: number[]]
}>()

const templateName = ref('')
const templateDescription = ref('')
const selectedItemIndices = ref<number[]>([])

watch(
  () => props.show,
  (val) => {
    if (val) {
      templateName.value = props.sourceCourse ? `${props.sourceCourse} - 模板` : ''
      templateDescription.value = ''
      selectedItemIndices.value = props.courseItems.map((_, idx) => idx)
    }
  }
)

function getCategoryName(categoryId: string): string {
  return props.categories.find((c) => c.id === categoryId)?.name || '未分类'
}

function getCategoryColor(categoryId: string): string {
  return props.categories.find((c) => c.id === categoryId)?.color || '#71717a'
}

function selectAll() {
  selectedItemIndices.value = props.courseItems.map((_, idx) => idx)
}

function deselectAll() {
  selectedItemIndices.value = []
}

const canSave = computed(
  () =>
    templateName.value.trim() &&
    selectedItemIndices.value.length > 0
)

function handleSave() {
  if (!canSave.value) return
  emit('save', templateName.value.trim(), templateDescription.value.trim(), selectedItemIndices.value)
}
</script>
