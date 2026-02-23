import axios from 'axios';

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
    (res) => res,
    (error) => {
        const message =
            error?.response?.data?.message ??
            error?.message ??
            'Ошибка сети';

        return Promise.reject(new Error(message));
    },
);