<template>
  <div class="users-page">
    <header class="users-page__header">
      <h1 class="users-page__title">Users</h1>
    </header>

    <div class="users-page__search">
      <input
        v-model="searchInput"
        type="text"
        class="users-page__search-input"
        placeholder="Search..."
        aria-label="Search users"
        :disabled="store.isLoading"
      />
      <RouterLink to="/users/new" class="users-page__create">
        Создать пользователя
      </RouterLink>
    </div>

    <div v-if="store.error" class="users-page__error">
      <span>{{ store.error }}</span>
      <button
        type="button"
        class="users-page__retry"
        @click="store.fetchList()"
      >
        Повторить
      </button>
    </div>

    <p v-if="store.isLoading" class="users-page__loading">
      Загрузка...
    </p>

    <div class="users-page__table">
      <UsersTable
        :items="store.items"
        :is-loading="store.isLoading"
        @edit="onEdit"
      />
    </div>

    <div class="users-page__pagination">
      <Pagination
        :page="store.page"
        :limit="store.limit"
        :total="store.total"
        :disabled="store.isLoading"
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/entities/user/model/userStore';
import { parseUsersQuery, buildUsersQuery } from '@/entities/user/model/userQueries';
import { useRouteQuerySync } from '@/shared/composables/useRouteQuerySync';
import { useDebouncedRef } from '@/shared/composables/useDebouncedRef';
import type { UsersQueryState } from '@/entities/user/model/userQueries';
import UsersTable from '@/entities/user/ui/UsersTable.vue';
import Pagination from '@/shared/ui/Pagination/Pagination.vue';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const searchInput = ref('');

const { syncFromRoute, syncToRoute } = useRouteQuerySync<UsersQueryState>({
  routeQuery: () => route.query as Record<string, unknown>,
  replaceQuery: (q) => router.replace({ query: q }),
  parse: parseUsersQuery,
  build: buildUsersQuery,
  onRouteChange: (next) => {
    store.applyQuery(next);
    searchInput.value = next.search;
  },
  getState: () => ({
    page: store.page,
    limit: store.limit,
    search: store.search,
  }),
});

const searchDebounced = useDebouncedRef(searchInput, 400);

let skipNextFetchFromRoute = false;

function applyAndFetch(state: UsersQueryState): void {
  store.applyQuery(state);
  searchInput.value = state.search;
  syncToRoute();
  skipNextFetchFromRoute = true;
  store.fetchList();
}

watch(
  searchDebounced,
  (value) => {
    if (value === store.search) return;
    applyAndFetch({
      page: 1,
      limit: store.limit,
      search: value,
    });
  },
  { immediate: false },
);

watch(
  () => route.query,
  () => {
    syncFromRoute();
    searchInput.value = store.search;
    if (!skipNextFetchFromRoute) store.fetchList();
    skipNextFetchFromRoute = false;
  },
  { deep: true },
);

function onPageChange(page: number): void {
  if (page === store.page) return;
  applyAndFetch({
    page,
    limit: store.limit,
    search: store.search,
  });
}

function onEdit(id: number): void {
  router.push(`/users/${id}/edit`);
}

onMounted(() => {
  syncFromRoute();
  searchInput.value = store.search;
  store.fetchList();
});
</script>

<style scoped lang="scss">
.users-page {
  padding: 1rem;
}

.users-page__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.users-page__title {
  margin: 0;
  font-size: 1.5rem;
}

.users-page__create {
  padding: 0.5rem 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: #333;
  color: #fff;
  text-decoration: none;
  font-size: 0.875rem;

  &:hover {
    opacity: 0.9;
  }
}

.users-page__search {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

.users-page__search-input {
  padding: 0.5rem 0.75rem;
  width: 100%;
  max-width: 20rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.users-page__error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #c00;
}

.users-page__retry {
  padding: 0.35rem 0.75rem;
  border: 1px solid #c00;
  border-radius: 4px;
  background: transparent;
  color: #c00;
  cursor: pointer;
}

.users-page__loading {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.users-page__search-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.users-page__table {
  margin-bottom: 1rem;
}

.users-page__pagination {
  margin-top: 1rem;
}
</style>
