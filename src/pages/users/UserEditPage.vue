<template>
  <div class="user-edit-page">
    <h1 class="user-edit-page__title">Редактирование пользователя</h1>

    <p v-if="invalidId" class="user-edit-page__error">
      Некорректный id
    </p>

    <template v-else-if="store.isLoading">
      <p class="user-edit-page__loading">Loading...</p>
    </template>

    <p v-else-if="store.error" class="user-edit-page__error">
      {{ store.error }}
    </p>

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
import { computed, onMounted, ref, watch } from 'vue';
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
.user-edit-page {
  padding: 1rem;
}

.user-edit-page__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.user-edit-page__error,
.user-edit-page__save-error {
  margin: 0 0 1rem;
  color: #c00;
}

.user-edit-page__loading {
  margin: 0 0 1rem;
}
</style>
