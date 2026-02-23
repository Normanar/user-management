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

## Подробно: что в папках src (для собеседования)

### app/

**Роль:** настройка приложения и глобальные ресурсы.

- **router/index.ts** — конфигурация Vue Router: маршруты `/users`, `/users/new`, `/users/:id/edit`, редирект остального на `/users`. Lazy-load компонентов через `() => import(...)`.
- **styles/** — глобальные стили: сброс (box-sizing, body), шрифты, переменные цветов/отступов (`variables.scss`). Подключаются в `main.ts` через `index.scss`.

### entities/user/

**Роль:** вся логика и UI, связанные с сущностью «пользователь». Не знает про роутер и другие сущности.

- **types.ts** — типы по контракту API: `User`, `UserStatus`, `UserCreateDto` (с `createdAt`), `UserUpdateDto` (без него), `UsersListQuery`, `UsersListResponse`. Один источник правды для API.
- **api/userApi.ts** — тонкая обёртка над `http`: `getUsers(query)`, `getUser(id)`, `createUser(payload)`, `updateUser(id, payload)`. Только вызовы HTTP, без store и router.
- **model/userQueries.ts** — работа с query-параметрами списка: константы `DEFAULT_USERS_PAGE`, `DEFAULT_USERS_LIMIT`, `MAX_USERS_LIMIT`; `parseUsersQuery(query)` — из сырого query (строки/массивы) в `{ page, limit, search }` с проверками и дефолтами; `buildUsersQuery(state)` — из state в объект для `router.replace({ query })`, без дефолтных значений.
- **model/userStore.ts** — Pinia store (Composition API): состояние списка (`items`, `total`, `page`, `limit`, `search`, `isLoading`, `error`), состояние карточки/форм (`currentUser`, `isDetailLoading`, `detailError`, `isSaving`, `saveError`). Экшены: `applyQuery`, `fetchList` (с защитой от гонок по `listRequestId`), `fetchOne`, `create` (добавляет `createdAt`), `update`, сбросы `resetListState`, `resetDetailState`, `resetSaveError`.
- **ui/UserForm.vue** — презентационная форма: props `initialValue`, `mode`, `isSubmitting`; emit `submit(payload)`. Использует `useValidate` (required, email, maxLength, oneOf для status), не вызывает API и не знает про store/router.
- **ui/UsersTable.vue** — презентационная таблица: props `items`, `isLoading`; emit `edit(id)`. Показывает колонки, загрузку, пустое состояние, кнопку «Редактировать». Не знает про store и API.

### pages/users/

**Роль:** сборка экранов: связывают маршрут, store, composables и UI-компоненты. Вся «проводка» живёт здесь.

- **UsersListPage.vue** — список: `useRouteQuerySync` (parse/build из userQueries, store как источник и приёмник state), debounce поиска через `useDebouncedRef`, вызовы `fetchList` при смене query/поиска/страницы, кнопка «Создать», таблица и пагинация. При уходе — `resetListState`.
- **UserCreatePage.vue** — создание: начальные значения формы, при submit — `store.create(payload)`, при успехе `router.replace('/users')`, показ `saveError`. При уходе — `resetSaveError`.
- **UserEditPage.vue** — редактирование: `id` из `route.params`, проверка на валидность; при монтировании `fetchOne(id)`; форма показывается после загрузки, initialValue из `currentUser`; при submit — `store.update(id, payload)` и редирект; показ `detailError` и `saveError`. При уходе — `resetDetailState`.

### shared/

**Роль:** код без привязки к конкретной сущности, переиспользуемый в разных фичах.

- **api/http.ts** — один axios-инстанс: `baseURL` из env (или localhost:3001), таймаут, заголовки. Interceptor: при ошибке достаёт сообщение из ответа или «Ошибка сети» и пробрасывает `Error(message)`.
- **composables/useDebouncedRef.ts** — принимает `Ref` и задержку; возвращает readonly ref, который обновляется с debounce; сброс таймера при новом значении и при unmount.
- **composables/useRouteQuerySync.ts** — синхронизация state с URL: приходит `routeQuery`, `replaceQuery`, `parse`, `build`, `onRouteChange`, `getState`. Даёт `syncFromRoute()` (парсит query и вызывает `onRouteChange`) и `syncToRoute()` (собирает query из state и вызывает `replaceQuery` при отличии). Внутри — защита от цикла через запоминание последнего записанного query. Есть хелпер `normalizeQuery` для сравнения.
- **composables/useValidate.ts** — универсальная валидация форм: `useValidate(initialValues, schema)` возвращает `values`, `errors`, `touched`, `setValues`, `setField`, `validateField`, `validateAll`, `touchField`, `touchAll`, `reset`. Правила: `required`, `email`, `maxLength(n)`, `oneOf(allowed)` — все возвращают `string | null`.
- **lib/formatDate.ts** — форматирование ISO-строки даты в читаемый вид (дата + время).
- **ui/Pagination/** — компонент пагинации: props `page`, `limit`, `total`, `disabled`; emit `change(page)`. Кнопки «Назад»/«Вперёд» и до 5 номеров страниц вокруг текущей.

На собеседовании можно сказать: **app** — роутинг и глобальные стили; **entities** — типы, API, store и UI одной сущности; **pages** — композиция экранов и связка с роутером и store; **shared** — общий HTTP-клиент, composables (валидация, debounce, URL sync) и переиспользуемые UI-компоненты.

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
