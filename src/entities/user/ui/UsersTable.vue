<template>
  <div class="users-table">
    <table class="users-table__table">
      <thead class="users-table__head">
        <tr class="users-table__row">
          <th class="users-table__cell">ID</th>
          <th class="users-table__cell">ФИО</th>
          <th class="users-table__cell">Email</th>
          <th class="users-table__cell">Дата создания</th>
          <th class="users-table__cell">Статус</th>
          <th class="users-table__cell users-table__cell--actions">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading" class="users-table__row users-table__loading">
          <td colspan="6" class="users-table__cell">Загрузка...</td>
        </tr>
        <tr v-else-if="items.length === 0" class="users-table__row users-table__empty">
          <td colspan="6" class="users-table__cell">Нет пользователей</td>
        </tr>
        <tr
          v-for="user in items"
          :key="user.id"
          class="users-table__row"
        >
          <td class="users-table__cell">{{ user.id }}</td>
          <td class="users-table__cell">{{ user.fullName }}</td>
          <td class="users-table__cell">{{ user.email }}</td>
          <td class="users-table__cell">{{ formatDate(user.createdAt) }}</td>
          <td class="users-table__cell">
            <span :class="['users-table__status', `users-table__status--${user.status}`]">
              {{ statusLabel(user.status) }}
            </span>
          </td>
          <td class="users-table__cell users-table__actions">
            <button
              type="button"
              class="users-table__btn"
              @click="emit('edit', user.id)"
            >
              Редактировать
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/shared/lib/formatDate';
import type { User, UserStatus } from '@/entities/user/types';

const props = withDefaults(
  defineProps<{
    items: User[];
    isLoading?: boolean;
  }>(),
  { isLoading: false },
);

const emit = defineEmits<{
  edit: [id: number];
}>();

function statusLabel(status: UserStatus): string {
  return status === 'active' ? 'Активен' : 'Заблокирован';
}
</script>

<style scoped lang="scss">
@use '@/app/styles/variables.scss' as *;

.users-table__table {
  width: 100%;
  border-collapse: collapse;
}

.users-table__head .users-table__cell {
  text-align: left;
  font-weight: 600;
}

.users-table__cell {
  padding: 0.5rem 0.75rem;
  border: 1px solid $color-border;
}

.users-table__cell--actions {
  width: 1%;
  white-space: nowrap;
}

.users-table__status--active {
  color: $color-success;
}

.users-table__status--blocked {
  color: $color-error;
}

.users-table__loading .users-table__cell,
.users-table__empty .users-table__cell {
  text-align: center;
  color: $color-text-muted;
}

.users-table__btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid $color-border;
  border-radius: 4px;
  background: $color-bg;
  cursor: pointer;
}
</style>
