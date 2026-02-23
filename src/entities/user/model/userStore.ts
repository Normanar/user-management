import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userApi } from '../api/userApi';
import type { User, UserCreateDto, UserUpdateDto } from '../types';
import { DEFAULT_USERS_LIMIT, DEFAULT_USERS_PAGE } from './userQueries';

export const useUserStore = defineStore('user', () => {
    const items = ref<User[]>([]);
    const total = ref(0);
    const page = ref(DEFAULT_USERS_PAGE);
    const limit = ref(DEFAULT_USERS_LIMIT);
    const search = ref('');
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const currentUser = ref<User | null>(null);
    const isDetailLoading = ref(false);
    const detailError = ref<string | null>(null);
    const isSaving = ref(false);
    const saveError = ref<string | null>(null);

    let listRequestId = 0;

    function applyQuery(next: { page: number; limit: number; search: string }): void {
        page.value = next.page;
        limit.value = next.limit;
        search.value = next.search;
    }

    async function fetchList(): Promise<void> {
        const id = ++listRequestId;
        isLoading.value = true;
        error.value = null;
        try {
            const res = await userApi.getUsers({
                page: page.value,
                limit: limit.value,
                search: search.value,
            });
            if (id !== listRequestId) return;
            items.value = res.items;
            total.value = res.total;
            page.value = res.page;
            limit.value = res.limit;
        } catch (e) {
            if (id !== listRequestId) return;
            error.value = e instanceof Error ? e.message : String(e);
        } finally {
            if (id === listRequestId) isLoading.value = false;
        }
    }

    async function fetchOne(id: number): Promise<void> {
        isDetailLoading.value = true;
        detailError.value = null;
        currentUser.value = null;
        try {
            const user = await userApi.getUser(id);
            currentUser.value = user;
        } catch (e) {
            detailError.value = e instanceof Error ? e.message : String(e);
        } finally {
            isDetailLoading.value = false;
        }
    }

    async function create(dto: UserUpdateDto): Promise<User> {
        isSaving.value = true;
        saveError.value = null;
        const payload: UserCreateDto = {
            ...dto,
            createdAt: new Date().toISOString(),
        };
        try {
            const user = await userApi.createUser(payload);
            return user;
        } catch (e) {
            saveError.value = e instanceof Error ? e.message : String(e);
            throw e;
        } finally {
            isSaving.value = false;
        }
    }

    async function update(id: number, dto: UserUpdateDto): Promise<User> {
        isSaving.value = true;
        saveError.value = null;
        try {
            const user = await userApi.updateUser(id, dto);
            return user;
        } catch (e) {
            saveError.value = e instanceof Error ? e.message : String(e);
            throw e;
        } finally {
            isSaving.value = false;
        }
    }

    function resetListState(): void {
        error.value = null;
    }

    function resetDetailState(): void {
        currentUser.value = null;
        detailError.value = null;
        saveError.value = null;
    }

    function resetSaveError(): void {
        saveError.value = null;
    }

    return {
        items,
        total,
        page,
        limit,
        search,
        isLoading,
        error,
        currentUser,
        isDetailLoading,
        detailError,
        isSaving,
        saveError,
        applyQuery,
        fetchList,
        fetchOne,
        create,
        update,
        resetListState,
        resetDetailState,
        resetSaveError,
    };
});
