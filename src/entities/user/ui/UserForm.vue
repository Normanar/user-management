<template>
  <form class="user-form" @submit.prevent="onSubmit">
    <div class="user-form__field">
      <label class="user-form__label" for="user-form-fullName">ФИО</label>
      <input
        id="user-form-fullName"
        :value="values.fullName"
        type="text"
        class="user-form__input"
        :disabled="isSubmitting"
        @input="(e) => setField('fullName', (e.target as HTMLInputElement).value)"
        @blur="onBlur('fullName')"
      />
      <p v-if="showError('fullName')" class="user-form__error">
        {{ errors.fullName }}
      </p>
    </div>

    <div class="user-form__field">
      <label class="user-form__label" for="user-form-email">Эл. почта</label>
      <input
        id="user-form-email"
        :value="values.email"
        type="email"
        class="user-form__input"
        :disabled="isSubmitting"
        @input="(e) => setField('email', (e.target as HTMLInputElement).value)"
        @blur="onBlur('email')"
      />
      <p v-if="showError('email')" class="user-form__error">
        {{ errors.email }}
      </p>
    </div>

    <div class="user-form__field">
      <label class="user-form__label" for="user-form-status">Статус</label>
      <select
        id="user-form-status"
        :value="values.status"
        class="user-form__select"
        :disabled="isSubmitting"
        @change="(e) => setField('status', (e.target as HTMLSelectElement).value as UserStatus)"
        @blur="onBlur('status')"
      >
        <option value="active">Активен</option>
        <option value="blocked">Заблокирован</option>
      </select>
      <p v-if="showError('status')" class="user-form__error">
        {{ errors.status }}
      </p>
    </div>

    <div class="user-form__actions">
      <button
        type="submit"
        class="user-form__submit"
        :class="{ 'user-form__submit--loading': isSubmitting }"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Сохранение...' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue';
import { useValidate, required, email } from '@/shared/composables/useValidate';
import type { UserStatus } from '@/entities/user/types';

type FormValues = {
  fullName: string;
  email: string;
  status: UserStatus;
};

const props = withDefaults(
  defineProps<{
    initialValue: FormValues;
    mode: 'create' | 'edit';
    isSubmitting: boolean;
    submitLabel?: string;
  }>(),
  {
    submitLabel: undefined,
  },
);

const emit = defineEmits<{
  submit: [payload: FormValues];
}>();

const defaultLabel = computed(() =>
  props.mode === 'create' ? 'Создать' : 'Сохранить',
);
const submitLabel = computed(() => props.submitLabel ?? defaultLabel.value);

const {
  values,
  errors,
  touched,
  setValues,
  setField,
  validateField,
  validateAll,
  touchField,
  touchAll,
} = useValidate<FormValues>(
  { fullName: '', email: '', status: 'active' },
  {
    fullName: [required()],
    email: [required(), email()],
    status: [required()],
  },
);

let submitAttempted = false;

function showError(key: keyof FormValues): boolean {
  return Boolean(
    errors.value[key] && (touched.value[key] || submitAttempted),
  );
}

function onBlur(key: keyof FormValues): void {
  touchField(key);
  validateField(key);
}

function onSubmit(): void {
  submitAttempted = true;
  touchAll();
  if (!validateAll()) return;
  emit('submit', { ...values.value });
}

watch(
  () => props.initialValue,
  (next) => setValues(next),
  { deep: true, immediate: true },
);
</script>

<style scoped lang="scss">
@use '@/app/styles/variables.scss' as *;

.user-form {
  max-width: 24rem;
}

.user-form__field {
  margin-bottom: 1rem;
}

.user-form__label {
  display: block;
  margin-bottom: 0.25rem;
}

.user-form__input,
.user-form__select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid $color-border;
  border-radius: 4px;
}

.user-form__error {
  margin: 0.25rem 0 0;
  color: $color-error;
  font-size: 0.875rem;
}

.user-form__actions {
  margin-top: 1.25rem;
}

.user-form__submit {
  padding: 0.5rem 1rem;
  border: 1px solid $color-primary;
  border-radius: 4px;
  background: $color-primary;
  color: $color-on-primary;
  cursor: pointer;

  &:disabled,
  &--loading {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>
