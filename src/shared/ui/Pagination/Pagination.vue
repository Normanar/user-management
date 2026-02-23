<template>
  <div class="pagination">
    <span class="pagination__info">Страница {{ safePage }} из {{ totalPages }}</span>
    <div class="pagination__controls">
      <button
        type="button"
        class="pagination__button"
        :class="{ 'pagination__button--disabled': prevDisabled }"
        :disabled="prevDisabled"
        @click="goPrev"
      >
        Назад
      </button>
      <button
        v-for="n in pageNumbers"
        :key="n"
        type="button"
        class="pagination__button"
        :class="{ 'pagination__button--active': n === safePage }"
        @click="goTo(n)"
      >
        {{ n }}
      </button>
      <button
        type="button"
        class="pagination__button"
        :class="{ 'pagination__button--disabled': nextDisabled }"
        :disabled="nextDisabled"
        @click="goNext"
      >
        Вперёд
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

const props = withDefaults(
  defineProps<{
    page: number;
    limit: number;
    total: number;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  change: [page: number];
}>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.limit)),
);

const safePage = computed(() =>
  clamp(props.page, 1, totalPages.value),
);

const pageNumbers = computed(() => {
  const start = Math.max(1, safePage.value - 2);
  const end = Math.min(totalPages.value, safePage.value + 2);
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
});

const prevDisabled = computed(
  () => props.disabled || safePage.value <= 1,
);

const nextDisabled = computed(
  () => props.disabled || safePage.value >= totalPages.value,
);

function goPrev(): void {
  if (prevDisabled.value) return;
  emit('change', safePage.value - 1);
}

function goNext(): void {
  if (nextDisabled.value) return;
  emit('change', safePage.value + 1);
}

function goTo(n: number): void {
  if (n === safePage.value) return;
  emit('change', n);
}
</script>

<style scoped lang="scss">
@use '@/app/styles/variables.scss' as *;

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination__info {
  margin-right: 0.5rem;
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination__button {
  min-width: 2.25rem;
  padding: 0.5rem;
  border: 1px solid $color-border;
  border-radius: 4px;
  background: $color-bg;
  cursor: pointer;

  &--active {
    font-weight: 600;
    border-color: $color-border-dark;
    background: $color-bg-secondary;
  }

  &--disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
