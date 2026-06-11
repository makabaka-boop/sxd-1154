<template>
  <div class="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
    <button
      v-for="role in roles"
      :key="role.value"
      @click="$emit('change', role.value)"
      :class="[
        'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
        currentRole === role.value
          ? 'bg-white shadow-sm text-teal-700'
          : 'text-zinc-500 hover:text-zinc-700',
      ]"
    >
      {{ role.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '@/types'
import { ROLE_LABELS } from '@/types'

defineProps<{ currentRole: UserRole }>()
defineEmits<{ change: [role: UserRole] }>()

const roles: { value: UserRole; label: string }[] = Object.entries(ROLE_LABELS).map(
  ([value, label]) => ({ value: value as UserRole, label })
)
</script>
