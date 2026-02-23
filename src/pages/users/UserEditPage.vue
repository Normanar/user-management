<template>
  <div class="user-edit-page">
    <header class="user-edit-page__header">
      <RouterLink to="/users" class="user-edit-page__back">Назад</RouterLink>
      <h1 class="user-edit-page__title">Редактирование пользователя</h1>
    </header>

    <p v-if="invalidId" class="user-edit-page__error">
      Некорректный id
    </p>

    <template v-else-if="store.isDetailLoading">
      <p class="user-edit-page__loading">Загрузка...</p>
    </template>

    <div v-else-if="store.detailError" class="user-edit-page__error">
      <span>{{ store.detailError }}</span>
      <button
        type="button"
        class="user-edit-page__retry"
        @click="store.fetchOne(id)"
      >
        Повторить
      </button>
    </div>

    <template v-else-if="store.currentUser">
      <p v-if="store.saveError" class="user-edit-page__save-error">
        {{ store.saveError }}
      </p>
      <UserForm
        v-if="initialValue"
        :initial-value="initialValue"
        mode="edit"
        :is-submitting="store.isSaving"
        @submit="onSubmit"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/entities/user/model/userStore';
import UserForm from '@/entities/user/ui/UserForm.vue';
import type { UserStatus } from '@/entities/user/types';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const id = computed(() => Number(route.params.id));
const invalidId = computed(() => {
  const n = id.value;
  return !Number.isFinite(n) || n <= 0;
});

const initialValue = ref<{
  fullName: string;
  email: string;
  status: UserStatus;
} | null>(null);

watch(
  () => store.currentUser,
  (user) => {
    if (!user) return;
    initialValue.value = {
      fullName: user.fullName,
      email: user.email,
      status: user.status,
    };
  },
  { immediate: true },
);

onMounted(() => {
  if (invalidId.value) return;
  store.fetchOne(id.value);
});

onBeforeUnmount(() => {
  store.resetDetailState();
});

async function onSubmit(payload: {
  fullName: string;
  email: string;
  status: UserStatus;
}): Promise<void> {
  if (invalidId.value) return;
  try {
    await store.update(id.value, payload);
    router.replace('/users');
  } catch {
    // saveError already set in store
  }
}
</script>

<style scoped lang="scss">
@use '@/app/styles/variables.scss' as *;

.user-edit-page {
  padding: 1rem;
}

.user-edit-page__header {
  margin-bottom: 1rem;
}

.user-edit-page__back {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: $color-text;
  text-decoration: none;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
}

.user-edit-page__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.user-edit-page__error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem;
  color: $color-error;
}

.user-edit-page__retry {
  padding: 0.35rem 0.75rem;
  border: 1px solid $color-error;
  border-radius: 4px;
  background: transparent;
  color: $color-error;
  cursor: pointer;
}

.user-edit-page__save-error {
  margin: 0 0 1rem;
  color: $color-error;
}

.user-edit-page__loading {
  margin: 0 0 1rem;
}
</style>
