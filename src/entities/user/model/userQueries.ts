export const DEFAULT_USERS_PAGE = 1;
export const DEFAULT_USERS_LIMIT = 40;

export type UsersQueryState = {
    page: number;
    limit: number;
    search: string;
};

function toQueryString(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0];
    return '';
}

function parseIntClamp(value: unknown, min: number, fallback: number): number {
    const s = toQueryString(value);
    if (s === '') return fallback;
    const n = Number.parseInt(s, 10);
    if (!Number.isFinite(n) || n < min) return fallback;
    return n;
}

export function parseUsersQuery(query: Record<string, unknown>): UsersQueryState {
    return {
        page: parseIntClamp(query.page, 1, DEFAULT_USERS_PAGE),
        limit: parseIntClamp(query.limit, 1, DEFAULT_USERS_LIMIT),
        search: toQueryString(query.search).trim(),
    };
}

export function buildUsersQuery(state: UsersQueryState): Record<string, string> {
    const out: Record<string, string> = {};
    if (state.page !== DEFAULT_USERS_PAGE) out.page = String(state.page);
    if (state.limit !== DEFAULT_USERS_LIMIT) out.limit = String(state.limit);
    if (state.search !== '') out.search = state.search;
    return out;
}
