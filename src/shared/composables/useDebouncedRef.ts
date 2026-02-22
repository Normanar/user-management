import { ref, watch, onBeforeUnmount, type Ref } from 'vue';

export function useDebouncedRef<T>(source: Ref<T>, delayMs = 400): Readonly<Ref<T>> {
    const debounced = ref(source.value) as Ref<T>;
    let timer: ReturnType<typeof setTimeout> | null = null;

    watch(
        source,
        (value) => {
            if (timer !== null) clearTimeout(timer);
            timer = setTimeout(() => {
                debounced.value = value;
                timer = null;
            }, delayMs);
        },
        { flush: 'sync' },
    );

    onBeforeUnmount(() => {
        if (timer !== null) clearTimeout(timer);
    });

    return debounced;
}

/*
Usage (search input on /users):

const searchInput = ref('');
const searchDebounced = useDebouncedRef(searchInput, 400);

// Bind v-model to searchInput; use searchDebounced for API/store sync.
watch(searchDebounced, (v) => { ... }, { immediate: true });
*/
