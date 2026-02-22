import { ref, type Ref } from 'vue';

export type ValidationResult = string | null;
export type Rule<T> = (value: T, values: Record<string, unknown>) => ValidationResult;
export type RulesSchema<TValues extends Record<string, unknown>> = {
  [K in keyof TValues]?: Rule<TValues[K]>[];
};

export function useValidate<TValues extends Record<string, unknown>>(
  initialValues: TValues,
  schema: RulesSchema<TValues>,
): {
  values: Ref<TValues>;
  errors: Ref<Partial<Record<keyof TValues, string>>>;
  touched: Ref<Partial<Record<keyof TValues, boolean>>>;
  setValues: (next: TValues) => void;
  setField: <K extends keyof TValues>(key: K, value: TValues[K]) => void;
  validateField: <K extends keyof TValues>(key: K) => boolean;
  validateAll: () => boolean;
  touchField: <K extends keyof TValues>(key: K) => void;
  touchAll: () => void;
  reset: (next?: TValues) => void;
} {
  const values = ref<TValues>({ ...initialValues }) as Ref<TValues>;
  const errors = ref<Partial<Record<keyof TValues, string>>>({}) as Ref<
    Partial<Record<keyof TValues, string>>
  >;
  const touched = ref<Partial<Record<keyof TValues, boolean>>>({}) as Ref<
    Partial<Record<keyof TValues, boolean>>
  >;

  function setValues(next: TValues): void {
    values.value = next;
  }

  function setField<K extends keyof TValues>(key: K, value: TValues[K]): void {
    values.value = { ...values.value, [key]: value };
  }

  function validateField<K extends keyof TValues>(key: K): boolean {
    const rules = schema[key];
    if (!rules || rules.length === 0) {
      const next = { ...errors.value };
      delete next[key];
      errors.value = next;
      return true;
    }
    const value = values.value[key];
    const allValues = values.value as Record<string, unknown>;
    for (const rule of rules) {
      const result = rule(value, allValues);
      if (result !== null) {
        errors.value = { ...errors.value, [key]: result };
        return false;
      }
    }
    const next = { ...errors.value };
    delete next[key];
    errors.value = next;
    return true;
  }

  function validateAll(): boolean {
    const keys = Object.keys(schema) as (keyof TValues)[];
    for (const key of keys) {
      validateField(key);
    }
    return !keys.some((k) => errors.value[k]);
  }

  function touchField<K extends keyof TValues>(key: K): void {
    touched.value = { ...touched.value, [key]: true };
  }

  function touchAll(): void {
    const keys = Object.keys(values.value) as (keyof TValues)[];
    touched.value = Object.fromEntries(keys.map((k) => [k, true])) as Partial<
      Record<keyof TValues, boolean>
    >;
  }

  function reset(next?: TValues): void {
    errors.value = {};
    touched.value = {};
    values.value = next !== undefined ? next : ({ ...initialValues } as TValues);
  }

  return {
    values,
    errors,
    touched,
    setValues,
    setField,
    validateField,
    validateAll,
    touchField,
    touchAll,
    reset,
  };
}

export const required = (msg = 'Обязательное поле'): Rule<unknown> => (value) => {
  if (value === undefined || value === null) return msg;
  if (typeof value === 'string' && value.trim() === '') return msg;
  return null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const email = (msg = 'Некорректный email'): Rule<string> => (value) => {
  if (value === undefined || value === null || value === '') return null;
  return EMAIL_REGEX.test(String(value).trim()) ? null : msg;
};

/*
Usage example (form with fullName, email, status):

type FormValues = { fullName: string; email: string; status: 'active' | 'blocked' };

const { values, errors, setField, validateField, validateAll, touchField, touchAll, reset } =
  useValidate<FormValues>(
    { fullName: '', email: '', status: 'active' },
    {
      fullName: [required()],
      email: [required(), email()],
      status: [],
    },
  );

// on submit:
touchAll();
if (!validateAll()) return;
await createUser({ ...values.value, createdAt: new Date().toISOString() });

// bind input: v-model="values.fullName" or :modelValue="values.fullName" @update:modelValue="v => setField('fullName', v)"
// on blur: touchField('fullName'); validateField('fullName');
*/
