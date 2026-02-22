export type UserStatus = 'active' | 'blocked';

export interface User {
    id: number;
    fullName: string;
    email: string;
    createdAt: string; // ISO
    status: UserStatus;
}

// DTO для create/update (то, что отправляем)
export interface UserUpsertDto {
    fullName: string;
    email: string;
    status: UserStatus;
}

// Параметры списка
export interface UsersListQuery {
    page: number;
    limit: number;
    search: string;
}

// Ответ списка от сервера (под json-server обвес)
export interface UsersListResponse {
    items: User[];
    total: number;
    page: number;
    limit: number;
}