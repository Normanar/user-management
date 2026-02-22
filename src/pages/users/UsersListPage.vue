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
      />
    </div>

    <div v-if="store.error" class="users-page__error">
      {{ store.error }}
    </div>

    <div v-else-if="store.isLoading" class="users-page__loading">
      Loading...
    </div>

    <template v-else>
      <div class="users-page__table">
        <UsersTable :items="store.items" />
      </div>

      <div class="users-page__pagination">
        <button
          type="button"
          class="users-page__pagination-btn"
          :disabled="store.page <= 1"
          @click="goPrev"
        >
          Prev
        </button>
        <span class="users-page__pagination-info">
          {{ store.page }} / {{ totalPages }}
        </span>
        <button
          type="button"
          class="users-page__pagination-btn"
          :disabled="store.page * store.limit >= store.total"
          @click="goNext"
        >
          Next
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/entities/user/model/userStore';
import { parseUsersQuery, buildUsersQuery } from '@/entities/user/model/userQueries';
import { useRouteQuerySync } from '@/shared/composables/useRouteQuerySync';
import { useDebouncedRef } from '@/shared/composables/useDebouncedRef';
import type { UsersQueryState } from '@/entities/user/model/userQueries';
import UsersTable from '@/entities/user/ui/UsersTable.vue';

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

const totalPages = computed(() =>
  store.total > 0 ? Math.ceil(store.total / store.limit) : 1,
);

function goPrev(): void {
  if (store.page <= 1) return;
  applyAndFetch({
    page: store.page - 1,
    limit: store.limit,
    search: store.search,
  });
}

function goNext(): void {
  if (store.page * store.limit >= store.total) return;
  applyAndFetch({
    page: store.page + 1,
    limit: store.limit,
    search: store.search,
  });
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
  margin-bottom: 1rem;
}

.users-page__title {
  margin: 0;
  font-size: 1.5rem;
}

.users-page__search {
  margin-bottom: 1rem;
}

.users-page__search-input {
  padding: 0.5rem 0.75rem;
  width: 100%;
  max-width: 20rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.users-page__error {
  color: #c00;
  margin-bottom: 1rem;
}

.users-page__loading {
  margin-bottom: 1rem;
}

.users-page__table {
  margin-bottom: 1rem;
}

.users-page__pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.users-page__pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
