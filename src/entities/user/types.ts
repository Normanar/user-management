export type UserStatus = 'active' | 'blocked';

export interface User {
    id: number;
    fullName: string;
    email: string;
    createdAt: string;
    status: UserStatus;
}

export interface UserCreateDto {
    fullName: string;
    email: string;
    status: UserStatus;
    createdAt: string;
}

export interface UserUpdateDto {
    fullName: string;
    email: string;
    status: UserStatus;
}

export interface UsersListQuery {
    page: number;
    limit: number;
    search: string;
}

export interface UsersListResponse {
    items: User[];
    total: number;
    page: number;
    limit: number;
}
