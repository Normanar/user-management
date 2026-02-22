import { http } from '@/shared/api/http';
import type { User, UserUpsertDto, UsersListQuery, UsersListResponse } from '../types';

export const userApi = {
    async getUsers(query: UsersListQuery): Promise<UsersListResponse> {
        const res = await http.get<UsersListResponse>('/api/users', { params: query });
        return res.data;
    },

    async getUser(id: number): Promise<User> {
        const res = await http.get<User>(`/api/users/${id}`);
        return res.data;
    },

    async createUser(payload: UserUpsertDto): Promise<User> {
        const res = await http.post<User>('/api/users', payload);
        return res.data;
    },

    async updateUser(id: number, payload: UserUpsertDto): Promise<User> {
        const res = await http.patch<User>(`/api/users/${id}`, payload);
        return res.data;
    },
};