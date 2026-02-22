export type RouteQuery = Record<string, unknown>;
export type RouteQueryOut = Record<string, string>;

export function normalizeQuery(q: RouteQuery | RouteQueryOut): Record<string, string> {
    const out: Record<string, string> = {};
    for (const key of Object.keys(q)) {
        const v = q[key];
        let s: string;
        if (v === undefined || v === null) s = '';
        else if (typeof v === 'string') s = v;
        else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') s = v[0];
        else s = '';
        if (s !== '') out[key] = s;
    }
    return out;
}

function queryEqual(a: Record<string, string>, b: Record<string, string>): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => keysB.includes(k) && a[k] === b[k]);
}

export function useRouteQuerySync<TState>(params: {
    routeQuery: () => RouteQuery;
    replaceQuery: (q: RouteQueryOut) => void;
    parse: (q: RouteQuery) => TState;
    build: (s: TState) => RouteQueryOut;
    onRouteChange: (next: TState) => void;
    getState: () => TState;
}): {
    syncFromRoute: () => void;
    syncToRoute: () => void;
} {
    let lastQuerySnapshot: Record<string, string> | null = null;

    function syncFromRoute(): void {
        const current = params.routeQuery();
        const norm = normalizeQuery(current);
        if (lastQuerySnapshot !== null && queryEqual(norm, lastQuerySnapshot)) {
            lastQuerySnapshot = null;
            return;
        }
        lastQuerySnapshot = null;
        const parsed = params.parse(current);
        params.onRouteChange(parsed);
    }

    function syncToRoute(): void {
        const nextQuery = params.build(params.getState());
        const normNext = normalizeQuery(nextQuery);
        const currentNorm = normalizeQuery(params.routeQuery());
        if (queryEqual(normNext, currentNorm)) return;
        lastQuerySnapshot = normNext;
        params.replaceQuery(nextQuery);
    }

    return { syncFromRoute, syncToRoute };
}

/*
Usage example (UsersListPage):

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const { syncFromRoute, syncToRoute } = useRouteQuerySync({
  routeQuery: () => route.query,
  replaceQuery: (q) => router.replace({ query: q }),
  parse: parseUsersQuery,
  build: buildUsersQuery,
  onRouteChange: (state) => {
    userStore.page = state.page;
    userStore.limit = state.limit;
    userStore.search = state.search;
  },
  getState: () => ({
    page: userStore.page,
    limit: userStore.limit,
    search: userStore.search,
  }),
});

onMounted(() => {
  syncFromRoute();
  userStore.fetchList();
});

watch(
  () => [userStore.page, userStore.limit, userStore.search],
  () => syncToRoute(),
);

watch(
  () => route.query,
  () => syncFromRoute(),
  { deep: true },
);
*/
