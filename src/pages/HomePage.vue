<template>
  <div class="h-screen flex flex-col bg-zinc-50 min-w-[1200px]">
    <header class="bg-white border-b border-zinc-200 px-6 py-3 flex-shrink-0">
      <div class="flex items-center justify-between min-w-0">
        <div class="flex items-center gap-2.5 flex-shrink-0">
          <div class="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0">
            <ClipboardList class="w-4.5 h-4.5 text-white" />
          </div>
          <div class="flex-shrink-0">
            <h1 class="text-base font-bold text-zinc-800 leading-tight whitespace-nowrap">课程物品准备</h1>
            <p class="text-xs text-zinc-400 whitespace-nowrap">培训活动物资管理</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <RoleSelector :current-role="currentRole" @change="setRole" />

          <div class="w-px h-6 bg-zinc-200" />

          <button
            @click="toggleCheckMode"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              isCheckMode
                ? 'bg-orange-100 text-orange-700 shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
            ]"
          >
            <Eye v-if="isCheckMode" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
            {{ isCheckMode ? '核对模式' : '全量模式' }}
          </button>

          <button
            v-if="canViewAudit"
            @click="showAuditLog = true"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
          >
            <History class="w-4 h-4" />
            变更记录
          </button>

          <button
            @click="showGapAnalysis = true"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors relative"
          >
            <ShieldAlert class="w-4 h-4" />
            缺口分析
            <span
              v-if="issueSummary.criticalCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
            >
              {{ issueSummary.criticalCount > 9 ? '9+' : issueSummary.criticalCount }}
            </span>
          </button>

          <button
            v-if="canManageCategories"
            @click="showCategoryModal = true"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
          >
            <Tag class="w-4 h-4" />
            分类
          </button>

          <button
            v-if="canExport"
            @click="handleExport"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-teal-700 text-white hover:bg-teal-800 transition-colors"
          >
            <Download class="w-4 h-4" />
            导出
          </button>
        </div>
      </div>
    </header>

    <div class="px-6 pt-4 flex-shrink-0">
      <CourseOverviewCard
        :course-stats="courseStats"
        :overall-stats="overallStats"
        :selected-course="filters.course"
        @select-course="handleSelectCourse"
        @clear-course="handleClearCourseFilter"
      />
    </div>

    <div class="px-6 pt-4 flex-shrink-0">
      <FilterBar
        :filters="filters"
        :courses="allCourses"
        :categories="sortedCategories"
        :responsibles="allResponsibles"
        :has-active-filters="hasActiveFilters"
        @set-filter="setFilter"
        @reset-filters="resetFilters"
      />
    </div>

    <div class="px-6 pt-3">
      <AutoCheckBanner
        :issues="issueSummary.issues"
        :critical-count="issueSummary.criticalCount"
        :warning-count="issueSummary.warningCount"
      />
    </div>

    <div class="flex-1 flex overflow-hidden px-6 pb-4 gap-4">
      <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-white rounded-xl border border-zinc-200 flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div class="flex items-center gap-3">
              <span class="text-sm text-zinc-500">
                {{ displayItems.length }} 项
              </span>
              <span v-if="isCheckMode" class="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                核对模式
              </span>
              <span
                v-if="filters.course"
                class="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded flex items-center gap-1"
              >
                <BookOpen class="w-3 h-3" />
                {{ filters.course }}
              </span>
            </div>
            <button
              v-if="isAdmin"
              @click="startAddItem"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-teal-700 text-white hover:bg-teal-800 transition-colors"
            >
              <Plus class="w-4 h-4" />
              新增物品
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <ItemRow
              v-for="item in displayItems"
              :key="item.id"
              :item="item"
              :is-detail-selected="selectedItemId === item.id"
              :is-batch-selected="selectedItemIds.includes(item.id)"
              :category-name="getCategoryName(item.categoryId)"
              :category-color="getCategoryColor(item.categoryId)"
              :can-edit="canEdit"
              :can-batch-edit="!isAuditor && canEdit"
              :is-check-mode="isCheckMode"
              @select="selectItem(item.id)"
              @toggle-select="toggleItemSelection(item.id)"
            />

            <div v-if="displayItems.length === 0" class="text-center py-16 text-zinc-400">
              <Package class="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p class="text-sm">
                {{ isCheckMode ? '核对模式下暂无缺口项或待处理项' : '暂无物品记录' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-[400px] flex-shrink-0">
        <div class="bg-white rounded-xl border border-zinc-200 h-full overflow-hidden">
          <ItemDetail
            :item="currentItem"
            :is-new="isNewItem"
            :categories="sortedCategories"
            :can-edit="canEdit"
            :can-delete="canDelete"
            :is-admin="isAdmin"
            :cleared-notice="clearedNotice"
            :is-duplicate="isCurrentDuplicate"
            :has-gap="currentHasGap"
            @close="closeDetail"
            @save="handleSaveItem"
            @delete="handleDeleteItem"
          />
        </div>
      </div>
    </div>

    <BatchActionBar
      v-if="selectedItemIds.length > 0 && !isAuditor"
      :selected-ids="selectedItemIds"
      @batch-update="handleBatchUpdate"
      @clear-selection="selectedItemIds = []"
    />

    <CategoryModal
      :show="showCategoryModal"
      :sorted-categories="sortedCategories"
      @close="showCategoryModal = false"
      @add-category="addCategory"
      @update-category="updateCategory"
      @delete-category="handleDeleteCategory"
    />

    <GapAnalysisPanel
      :show="showGapAnalysis"
      :issues="issueSummary.issues"
      @close="showGapAnalysis = false"
      @navigate="navigateToItem"
      @filter-by-course="handleFilterByCourseFromGap"
    />

    <AuditLogPanel
      :show="showAuditLog"
      :logs="auditLog"
      @close="showAuditLog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  ClipboardList, Plus, Download, Tag, ShieldAlert, History,
  Eye, EyeOff, Package, BookOpen,
} from 'lucide-vue-next'
import RoleSelector from '@/components/RoleSelector.vue'
import FilterBar from '@/components/FilterBar.vue'
import AutoCheckBanner from '@/components/AutoCheckBanner.vue'
import ItemRow from '@/components/ItemRow.vue'
import ItemDetail from '@/components/ItemDetail.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import CategoryModal from '@/components/CategoryModal.vue'
import GapAnalysisPanel from '@/components/GapAnalysisPanel.vue'
import AuditLogPanel from '@/components/AuditLogPanel.vue'
import CourseOverviewCard from '@/components/CourseOverviewCard.vue'
import { useItems } from '@/composables/useItems'
import { useCategories } from '@/composables/useCategories'
import { useRole } from '@/composables/useRole'
import { useFilters } from '@/composables/useFilters'
import { useCheckMode } from '@/composables/useCheckMode'
import { useAutoCheck } from '@/composables/useAutoCheck'
import { useExport } from '@/composables/useExport'
import { useAuditLog } from '@/composables/useAuditLog'
import { useCourseStats } from '@/composables/useCourseStats'
import type { Item, ItemStatus } from '@/types'

const {
  items, addItem, updateItem, deleteItem, batchUpdateStatus,
  computeGapLevel, checkDuplicate, refreshGapLevels, allCourses, allResponsibles,
} = useItems()
const {
  sortedCategories, addCategory, updateCategory, deleteCategory,
  getCategoryName, getCategoryColor,
} = useCategories()
const {
  currentRole, setRole, isAdmin, isUser, isAuditor, canEdit, canDelete,
  canManageCategories, canViewAudit, canExport,
} = useRole()
const { filters, setFilter, resetFilters, filterItems, hasActiveFilters } = useFilters()
const { isCheckMode, toggleCheckMode, filterForCheckMode } = useCheckMode()
const { runChecks, getIssueSummary } = useAutoCheck()
const { exportToCSV } = useExport()
const { auditLog } = useAuditLog()
const { computeCourseStats, computeOverallStats } = useCourseStats()

const selectedItemId = ref<string | null>(null)
const selectedItemIds = ref<string[]>([])
const isNewItem = ref(false)
const showDetail = ref(false)
const clearedNotice = ref('')
const showCategoryModal = ref(false)
const showGapAnalysis = ref(false)
const showAuditLog = ref(false)

const filteredItems = computed(() => filterItems(items.value))
const displayItems = computed(() => filterForCheckMode(filteredItems.value))

const issueSummary = computed(() => getIssueSummary(items.value))

const courseStats = computed(() => computeCourseStats(displayItems.value))
const overallStats = computed(() => computeOverallStats(displayItems.value))

const currentItem = computed(() => {
  if (isNewItem.value) return null
  if (!selectedItemId.value) return null
  return items.value.find((i) => i.id === selectedItemId.value) ?? null
})

const isCurrentDuplicate = computed(() => {
  if (!currentItem.value) return false
  return checkDuplicate(currentItem.value)
})

const currentHasGap = computed(() => {
  if (!currentItem.value) return false
  return computeGapLevel(currentItem.value) !== 'none'
})

watch(
  () => displayItems.value,
  (newItems) => {
    if (selectedItemId.value && !newItems.find((i) => i.id === selectedItemId.value)) {
      if (!isNewItem.value) {
        clearedNotice.value = '当前选中项已被筛选条件过滤，详情已清空'
        selectedItemId.value = null
        setTimeout(() => { clearedNotice.value = '' }, 3000)
      }
    }
    selectedItemIds.value = selectedItemIds.value.filter(
      (id) => newItems.find((i) => i.id === id)
    )
  }
)

watch(
  currentRole,
  () => {
    selectedItemIds.value = []
    isNewItem.value = false
  }
)

function selectItem(id: string) {
  isNewItem.value = false
  clearedNotice.value = ''
  selectedItemId.value = selectedItemId.value === id ? null : id
}

function toggleItemSelection(id: string) {
  const idx = selectedItemIds.value.indexOf(id)
  if (idx >= 0) {
    selectedItemIds.value.splice(idx, 1)
  } else {
    selectedItemIds.value.push(id)
  }
}

function startAddItem() {
  isNewItem.value = true
  selectedItemId.value = null
  clearedNotice.value = ''
}

function closeDetail() {
  isNewItem.value = false
  selectedItemId.value = null
  clearedNotice.value = ''
}

function handleSaveItem(data: Partial<Item>) {
  if (isNewItem.value) {
    if (!isAdmin.value) return
    const newItem = addItem(
      {
        name: data.name!,
        categoryId: data.categoryId!,
        course: data.course!,
        quantity: data.quantity ?? 0,
        minQuantity: data.minQuantity ?? 0,
        location: data.location ?? '',
        responsible: data.responsible ?? '',
        status: data.status ?? 'pending',
        notes: data.notes ?? '',
      },
      '当前用户',
      currentRole.value
    )
    isNewItem.value = false
    selectedItemId.value = newItem.id
  } else if (selectedItemId.value) {
    if (isUser.value) {
      const safeData: Partial<Item> = {}
      if ('quantity' in data) safeData.quantity = data.quantity
      if ('location' in data) safeData.location = data.location
      if ('status' in data) safeData.status = data.status
      if ('notes' in data) safeData.notes = data.notes
      updateItem(selectedItemId.value, safeData, '当前用户', currentRole.value)
    } else {
      updateItem(selectedItemId.value, data, '当前用户', currentRole.value)
    }
  }
}

function handleDeleteItem(id: string) {
  deleteItem(id, '当前用户', currentRole.value)
  selectedItemId.value = null
}

function handleBatchUpdate(status: ItemStatus) {
  batchUpdateStatus(selectedItemIds.value, status, '当前用户', currentRole.value)
  selectedItemIds.value = []
}

function handleDeleteCategory(id: string) {
  const hasItems = items.value.some((i) => i.categoryId === id)
  if (hasItems) {
    alert('该分类下仍有物品，无法删除')
    return
  }
  deleteCategory(id)
}

function handleExport() {
  exportToCSV(displayItems.value, getCategoryName)
}

function handleSelectCourse(course: string) {
  if (filters.course === course) {
    setFilter('course', '')
  } else {
    setFilter('course', course)
  }
}

function handleClearCourseFilter() {
  setFilter('course', '')
}

function handleFilterByCourseFromGap(course: string) {
  showGapAnalysis.value = false
  setFilter('course', course)
}

function navigateToItem(itemId: string, course?: string) {
  showGapAnalysis.value = false
  if (course) {
    setFilter('course', course)
  }
  isNewItem.value = false
  clearedNotice.value = ''
  selectedItemId.value = itemId
}

onMounted(() => {
  refreshGapLevels()
})
</script>
