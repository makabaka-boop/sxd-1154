<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 class="font-semibold text-zinc-800">分类管理</h3>
          <button @click="$emit('close')" class="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div
            v-for="cat in sortedCategories"
            :key="cat.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 hover:border-zinc-200 transition-colors"
          >
            <div class="w-4 h-4 rounded-full flex-shrink-0" :style="{ backgroundColor: cat.color }" />
            <template v-if="editingId === cat.id">
              <input v-model="editName" class="field-input flex-1 !py-1" />
              <input v-model="editColor" type="color" class="w-8 h-8 rounded cursor-pointer" />
              <button @click="saveEdit(cat.id)" class="text-teal-600 hover:text-teal-700">
                <Check class="w-4 h-4" />
              </button>
              <button @click="cancelEdit" class="text-zinc-400 hover:text-zinc-600">
                <X class="w-4 h-4" />
              </button>
            </template>
            <template v-else>
              <span class="flex-1 text-sm font-medium text-zinc-700">{{ cat.name }}</span>
              <button @click="startEdit(cat)" class="p-1 text-zinc-400 hover:text-zinc-600">
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button @click="$emit('deleteCategory', cat.id)" class="p-1 text-zinc-400 hover:text-red-500">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </template>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-zinc-100">
          <div v-if="isAdding" class="flex items-center gap-3 mb-3">
            <input v-model="newName" class="field-input flex-1 !py-1" placeholder="分类名称" />
            <input v-model="newColor" type="color" class="w-8 h-8 rounded cursor-pointer" />
            <button @click="addCategory" class="text-teal-600 hover:text-teal-700">
              <Check class="w-4 h-4" />
            </button>
            <button @click="isAdding = false" class="text-zinc-400 hover:text-zinc-600">
              <X class="w-4 h-4" />
            </button>
          </div>
          <button
            v-else
            @click="isAdding = true"
            class="w-full py-2 text-sm text-teal-600 hover:text-teal-700 border border-dashed border-teal-300 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-1"
          >
            <Plus class="w-4 h-4" />
            新增分类
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, Check, Pencil, Trash2, Plus } from 'lucide-vue-next'
import type { Category } from '@/types'

defineProps<{
  show: boolean
  sortedCategories: Category[]
}>()

const emit = defineEmits<{
  close: []
  addCategory: [name: string, color: string]
  updateCategory: [id: string, name: string, color: string]
  deleteCategory: [id: string]
}>()

const isAdding = ref(false)
const newName = ref('')
const newColor = ref('#0F766E')
const editingId = ref('')
const editName = ref('')
const editColor = ref('')

function addCategory() {
  if (!newName.value.trim()) return
  emit('addCategory', newName.value.trim(), newColor.value)
  newName.value = ''
  newColor.value = '#0F766E'
  isAdding.value = false
}

function startEdit(cat: Category) {
  editingId.value = cat.id
  editName.value = cat.name
  editColor.value = cat.color
}

function saveEdit(id: string) {
  if (!editName.value.trim()) return
  emit('updateCategory', id, editName.value.trim(), editColor.value)
  cancelEdit()
}

function cancelEdit() {
  editingId.value = ''
  editName.value = ''
  editColor.value = ''
}
</script>
