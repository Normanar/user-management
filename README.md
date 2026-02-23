# User Management

SPA для управления пользователями: просмотр списка с серверной пагинацией и поиском, создание и редактирование.

## Стек

- Vue 3 (Composition API) + TypeScript
- Vite
- Pinia (state management)
- Vue Router
- Axios
- SCSS (BEM)
- Mock API — json-server

## Быстрый старт

```bash
# Установить зависимости
npm install

# Запустить mock API (порт 3001) и dev-сервер (порт 5173) одновременно
npm run dev:all
```

Приложение будет доступно по адресу `http://localhost:5173/users`.

### Отдельные команды

| Команда           | Описание                              |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Только Vite dev-сервер (порт 5173)    |
| `npm run mock`    | Только mock API (порт 3001)           |
| `npm run dev:all` | Mock API + Vite одновременно          |
| `npm run build`   | Сборка для продакшена                 |
| `npm run preview` | Предпросмотр собранного бандла        |

## Структура проекта

```
src/
├── app/
│   ├── router/index.ts          # Маршруты
│   └── styles/                   # Глобальные стили, SCSS-переменные
│       ├── base.scss
│       ├── index.scss
│       └── variables.scss
├── entities/user/
│   ├── api/userApi.ts            # HTTP-запросы к API пользователей
│   ├── model/
│   │   ├── userQueries.ts        # Парсинг/сборка URL query (page, limit, search)
│   │   └── userStore.ts          # Pinia store: состояние списка и CRUD
│   ├── types.ts                  # Типы: User, DTO, query, response
│   └── ui/
│       ├── UserForm.vue          # Форма создания/редактирования (dumb)
│       └── UsersTable.vue        # Таблица пользователей (dumb)
├── pages/users/
│   ├── UsersListPage.vue         # Страница списка /users
│   ├── UserCreatePage.vue        # Страница создания /users/new
│   └── UserEditPage.vue          # Страница редактирования /users/:id/edit
├── shared/
│   ├── api/http.ts               # Axios-инстанс с interceptor
│   ├── composables/
│   │   ├── useDebouncedRef.ts    # Debounce для реактивных значений
│   │   ├── useRouteQuerySync.ts  # Синхронизация state <-> URL query
│   │   └── useValidate.ts        # Универсальный движок валидации форм
│   ├── lib/
│   │   └── formatDate.ts         # Форматирование даты
│   └── ui/
│       └── Pagination/
│           └── Pagination.vue    # Компонент пагинации
└── mock/
    ├── server.cjs                # json-server с кастомной обработкой GET /api/users
    └── db.json                   # Данные для mock API
```

## Архитектура и разделение ответственности

| Слой                    | Что делает                                                        | Что запрещено                     |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------- |
| **pages/**              | Композиция: подключает store, router, UI-компоненты               | Бизнес-логика, прямые API-вызовы  |
| **entities/*/api/**     | HTTP-запросы через `shared/api/http.ts`                           | Импорт router, store              |
| **entities/*/model/**   | Pinia store, бизнес-логика, парсинг query                         | Импорт router, UI                 |
| **entities/*/ui/**      | Dumb-компоненты: только отображение, props/emits                  | Импорт store, router, API         |
| **shared/composables/** | Переиспользуемые composables (валидация, debounce, URL sync)      | Привязка к конкретной сущности    |
| **shared/ui/**          | Переиспользуемые UI-компоненты (Pagination)                       | Бизнес-логика                     |

## Маршруты

| Путь               | Страница          | Описание                      |
| ------------------- | ----------------- | ----------------------------- |
| `/users`            | UsersListPage     | Список с пагинацией и поиском |
| `/users/new`        | UserCreatePage    | Создание пользователя         |
| `/users/:id/edit`   | UserEditPage      | Редактирование пользователя   |

## Как работает синхронизация URL

Параметры списка (`page`, `limit`, `search`) хранятся в URL query: `/users?page=2&search=ivan`.

- **Дефолтные значения не пишутся в URL** (page=1, limit по умолчанию, search пустой) — URL остаётся чистым.
- При входе на страницу — парсинг query через `parseUsersQuery()`, применение к store, загрузка данных.
- При изменении поиска/страницы — обновление store, сборка query через `buildUsersQuery()`, `router.replace()`.
- При нажатии «Назад»/«Вперёд» в браузере — watcher на `route.query` подхватывает изменения, обновляет store и перезагружает данные.
- Защита от циклов: `useRouteQuerySync` запоминает последний записанный query и игнорирует собственные изменения.

## Валидация форм

Используется универсальный `useValidate<TValues>(initialValues, schema)`:

- `schema` — объект с массивами правил для каждого поля.
- Правила: `required()`, `email()`, `maxLength(n)`, `oneOf(allowed)`.
- Каждое правило — чистая функция `(value, allValues) => string | null`.
- Ошибки показываются только для «тронутых» полей или после попытки сабмита.

## Mock API

Сервер: `mock/server.cjs`, данные: `mock/db.json`, порт: 3001.

| Метод  | Эндпоинт           | Описание                                          |
| ------ | ------------------- | ------------------------------------------------- |
| GET    | `/api/users`        | Список: `?page=1&limit=5&search=...` → `{ items, total, page, limit }` |
| GET    | `/api/users/:id`    | Один пользователь                                 |
| POST   | `/api/users`        | Создание (клиент добавляет `createdAt`)           |
| PATCH  | `/api/users/:id`    | Обновление (без `createdAt`)                      |

json-server **не генерирует** `createdAt` автоматически — это делает store при создании: `createdAt: new Date().toISOString()`.

## Как добавить новую сущность (например, roles)

1. Создать `src/entities/roles/types.ts` — типы, DTO, query, response.
2. Создать `src/entities/roles/api/rolesApi.ts` — HTTP-запросы через `shared/api/http.ts`.
3. Создать `src/entities/roles/model/rolesQueries.ts` — парсинг/сборка URL query (по аналогии с `userQueries.ts`).
4. Создать `src/entities/roles/model/rolesStore.ts` — Pinia store.
5. Создать UI-компоненты в `src/entities/roles/ui/` (таблица, форма).
6. Создать страницы в `src/pages/roles/` (список, создание, редактирование).
7. Добавить маршруты в `src/app/router/index.ts`.

Shared-слой (`useValidate`, `useRouteQuerySync`, `useDebouncedRef`, `Pagination`) переиспользуется без изменений.
