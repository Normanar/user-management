<template>
  <div class="user-create-page">
    <header class="user-create-page__header">
      <RouterLink to="/users" class="user-create-page__back">Назад</RouterLink>
      <h1 class="user-create-page__title">Создание пользователя</h1>
    </header>
    <p v-if="store.saveError" class="user-create-page__error">
      {{ store.saveError }}
    </p>
    <UserForm
      :initial-value="initialValue"
      mode="create"
      :is-submitting="store.isSaving"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/entities/user/model/userStore';
import UserForm from '@/entities/user/ui/UserForm.vue';
import type { UserStatus } from '@/entities/user/types';

const router = useRouter();
const store = useUserStore();

const initialValue = {
  fullName: '',
  email: '',
  status: 'active' as UserStatus,
};

async function onSubmit(payload: {
  fullName: string;
  email: string;
  status: UserStatus;
}): Promise<void> {
  try {
    await store.create(payload);
    router.replace('/users');
  } catch {
    // saveError already set in store
  }
}
</script>

<style scoped lang="scss">
.user-create-page {
  padding: 1rem;
}

.user-create-page__header {
  margin-bottom: 1rem;
}

.user-create-page__back {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: #333;
  text-decoration: none;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
}

.user-create-page__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.user-create-page__error {
  margin: 0 0 1rem;
  color: #c00;
}
</style>
