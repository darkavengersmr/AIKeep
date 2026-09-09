# AIKeep — план реализации

Google Keep-подобное приложение с совместными списками дел.

## 1. Рекомендуемая архитектура

**Вариант A: Next.js + PostgreSQL (App Router, Server Actions + Server Components).**

Обоснование:

- Все требования MVP (auth, CRUD заметок и списков, совместный доступ с ролями, проверка прав на сервере) укладываются в возможности Next.js: Server Actions для мутаций, Server Components для чтений, Prisma для доступа к данным.
- Realtime в MVP **не входит** (зафиксировано решением). Синхронизация через reload/refetch. Значит главный аргумент за Nest.js (WebSocket-инфраструктура) отпадает.
- Один сервис = один деплой, нет CORS, нет дублирования моделей/валидации, единый типобезопасный контур (Next.js + Prisma на TypeScript).
- Если в будущем понадобится realtime: SSE добавляется Route Handler'ом внутри того же Next.js, WebSocket — выносится в отдельный сервис/сервер только при реальной нагрузке. Схема БД от этого не меняется (БД — источник истины).

Правило: **Nest.js привлекаем только когда** realtime становится обязательным и требует низкой задержки/масштабирования, либо когда логика сервиса вырастает за пределы разумного для одного процесса. Сейчас этого нет.

## 2. Рекомендуемый стек

| Слой | Технология | Примечание |
|---|---|---|
| Фреймворк | Next.js 15 (App Router) + React + TypeScript | строгий `strict` mode |
| ORM / миграции | Prisma + `prisma migrate` | схема ниже, раздел 4 |
| База | PostgreSQL 16 | managed (Neon/Supabase) для MVP |
| Хеширование паролей | Argon2id (`@node-rs/argon2`) | OWASP-рекомендация |
| Сессии | HTTP-only cookie + сессии в БД (таблица Session) | отзыв при logout |
| Валидация | Zod | схемы в `src/server/validation/` |
| UI | Tailwind CSS + shadcn/ui | быстрые аккуратные примитивы |
| Клиентское состояние | React-состояние + Server Actions (без TanStack Query в MVP) | минимум зависимостей |
| Тесты | Vitest (unit бизнес-логики) + Playwright (e2e) | |
| Линт/формат | ESLint + Prettier (дефолт Next.js) | |
| Деплой | Vercel + Neon (или docker-compose на VPS) | раздел 8, этап 9 |
| Realtime | — (не в MVP) | план расширения: SSE → WebSocket, раздел 10 |

## 3. Структура проекта

```
aikeep/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                  # первый ADMIN, dev-код приглашения
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/              # group layout: requireAuth
│   │   │   ├── page.tsx                    # дашборд: заметки + списки
│   │   │   ├── notes/page.tsx
│   │   │   └── lists/[id]/page.tsx         # список + задачи + участники
│   │   ├── admin/invites/page.tsx          # только ADMIN
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # shadcn/ui примитивы
│   │   ├── auth/                # формы login/register
│   │   ├── notes/               # карточка заметки, grid, color picker
│   │   ├── todos/               # item row, checkbox, reorder, member manager
│   │   └── admin/
│   ├── server/                  # СЕРВЕРНАЯ бизнес-логика (без Next-зависимостей)
│   │   ├── auth/
│   │   │   ├── password.ts      # argon2id hash/verify
│   │   │   ├── session.ts       # create/verify/destroy, cookie
│   │   │   └── invitation.ts    # валидация и атомарный инкремент кода
│   │   ├── notes/service.ts
│   │   ├── todos/service.ts     # списки + элементы + reorder
│   │   ├── members/service.ts
│   │   ├── access/access.ts     # requireNoteOwner, requireMember/Editor/Owner
│   │   └── validation/schemas.ts
│   ├── actions/                 # тонкие обёртки: validate → service → revalidate
│   │   ├── auth.ts
│   │   ├── notes.ts
│   │   ├── todos.ts
│   │   └── members.ts
│   ├── lib/
│   │   ├── prisma.ts            # singleton PrismaClient
│   │   ├── auth.ts              # getCurrentUser(), requireAuth() — для страниц
│   │   └── errors.ts            # ApiError, AppError типы
│   └── types/index.ts
├── tests/
│   ├── unit/                    # vitest: password, invitation, access
│   └── e2e/                     # playwright
├── .env.example
├── .github/workflows/ci.yml
├── docker-compose.yml           # app + postgres (опция деплоя)
└── package.json
```

Ключевой принцип: **`src/server/` не зависит от Next.js** — вся логика, включая проверку прав, живёт там и покрывается Vitest-юнитами. `src/actions/` — тонкие адаптеры, которые достают текущего пользователя из сессии и вызывают сервис.

## 4. Схема базы данных (Prisma)

```prisma
generator client { provider = "prisma-client-js" }
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole   { USER ADMIN }
enum MemberRole { OWNER EDITOR VIEWER }

model User {
  id           String   @id @default(uuid())
  email        String   @unique            // хранить lowercased
  passwordHash String
  displayName  String
  role         UserRole @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  notes        Note[]
  sessions     Session[]
  memberships  TodoListMember[]
}

model Session {
  id         String   @id @default(uuid())
  tokenHash  String   @unique              // SHA-256(токен), сырой токен только в cookie
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  lastUsedAt DateTime @default(now())
  @@index([userId])
}

model InvitationCode {
  id          String    @id @default(uuid())
  code        String    @unique            // user-friendly, генерируемый
  isActive    Boolean   @default(true)
  maxUses     Int?                          // NULL = без лимита
  useCount    Int       @default(0)
  expiresAt   DateTime?
  createdById String?
  createdBy   User?     @relation(fields: [createdById], references: [id], onDelete: SetNull)
  createdAt   DateTime  @default(now())
}

model Note {
  id         String    @id @default(uuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title      String?
  content    String?
  color      String?
  isPinned   Boolean   @default(false)     // задел на будущее
  isArchived Boolean   @default(false)     // задел
  deletedAt  DateTime?                     // SOFT DELETE → корзина в будущем
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  @@index([userId, deletedAt, isPinned, updatedAt])
}

model TodoList {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  items     TodoItem[]
  members   TodoListMember[]
}

model TodoItem {
  id        String   @id @default(uuid())
  listId    String
  list      TodoList @relation(fields: [listId], references: [id], onDelete: Cascade)
  text      String
  isDone    Boolean  @default(false)
  position  Int                            // порядок; перенумерация при reorder
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([listId, position])
}

model TodoListMember {
  id        String     @id @default(uuid())
  listId    String
  list      TodoList   @relation(fields: [listId], references: [id], onDelete: Cascade)
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      MemberRole
  createdAt DateTime   @default(now())
  @@unique([listId, userId])
  @@index([userId])
}
```

Соглашения и правила:

- **Совместный доступ — полноценная модель.** Владелец — это участник с ролью `OWNER`, а не отдельное поле `ownerId` у списка (единый источник истины). Личный список = список с единственным участником-владельцем. Передача владения = смена ролей в транзакции.
- **Единственный OWNER на список.** Ограничение на уровне приложения: при операциях с ролями — транзакция с проверкой «у списка уже есть OWNER». Опционально добавить частичный уникальный индекс `CREATE UNIQUE INDEX ... ON TodoListMember(listId) WHERE role = 'OWNER'` через ручную миграцию.
- **Удаление.** `Note` — soft delete (`deletedAt`), чтоб заложить корзину. `TodoItem`/`TodoListMember` — hard delete (каскад). `TodoList` — hard delete с каскадом (владелец удаляет список — удаляется и совместный доступ; это ожидаемое поведение).
- **Атомарный расход кода-приглашения** — инкремент в одной atomic-операции с условиями (`isActive = true`, `expiresAt > now`, `useCount < maxUses`), без гонок.
- Timestamps: `createdAt`/`updatedAt` везде, `expiresAt` где нужно.

## 5. Модель авторизации

**Пароли:** Argon2id, параметры по умолчанию либы. Никогда не логируем, не возвращаем в API.

**Сессии:**

- Токен: `crypto.randomBytes(32)` → base64url.
- В БД хранится `SHA-256(токен)`, в cookie `session` — сырой токен.
- Cookie: `httpOnly`, `secure` (prod), `SameSite=Lax`, `path=/`, срок = срок сессии (30 дней, скользящее продление `lastUsedAt`).
- Logout удаляет сессию из БД (мгновенный отзыв) и чистит cookie.

**Регистрация (по коду-приглашению):**

1. Zod-валидация: `displayName` 3–50, `email` валидный, `password` ≥ 8 символов, `code` 6–20.
2. Проверка уникальности email (нижний регистр).
3. В одной транзакции: атомарный `updateMany` кода (`isActive && !expired && useCount < maxUses` → инкремент) — если затронуто 0 строк, код недействителен → ошибка «неверный или исчерпанный код».
4. Создание `User` (роль `USER`), создание сессии, установка cookie → авто-вход.
5. Первый ADMIN: seed-скрипт (env `ADMIN_EMAIL`) + dev-коды приглашений.

**Вход/выход:** `login` — поиск по email (lowercase), `argon2.verify`, создание сессии, ротация токена. `logout` — удаление сессии.

**Защита маршрутов:**

- `(main)` layout / загрузчики страниц: `requireAuth()` → редирект на `/login`.
- Каждая Server Action: `requireAuth()` + явная проверка прав на объект.
- API/CSRF: Server Actions по умолчанию устойчивы к CSRF (same-origin), лишний CSRF-слой не нужен.

**Защита от перебора:** простой rate-limit на `login` и `register` (in-memory счётчик на IP; в будущем — Upstash Redis).

## 6. Модель совместных списков

- Единая сущность `TodoListMember(listId, userId, role)`, роли `OWNER / EDITOR / VIEWER`. MVP включает OWNER и EDITOR (роль `VIEWER` присутствует в enum и схеме, но в MVP UI недоступна для назначения — архитектура готова).
- **Матрица прав** (все проверки — только на сервере, в `src/server/access/`):

| Операция | OWNER | EDITOR | VIEWER |
|---|:-:|:-:|:-:|
| Просмотр списка/задач/участников | ✓ | ✓ | ✓ |
| Переименовать список | ✓ | ✗ | ✗ |
| Удалить список | ✓ | ✗ | ✗ |
| Добавить/изменить/удалить задачу, отметить, reorder | ✓ | ✓ | ✗ |
| Добавить/удалить участника, сменить роль | ✓ | ✗ | ✗ |
| Передать владение | (пост-MVP) | ✗ | ✗ |

- **Добавление участника (MVP):** владелец вводит **точный email** → точный `findUnique` по email → создание членства `EDITOR`. Уже участник → ошибка. Несуществующий email → нейтральная ошибка «пользователь не найден» (без раскрытия факта регистрации).
- **Нельзя:** удалить OWNER'а из списка; назначить второго OWNER'а; сменить роль OWNER'а. (Смена/передача владения — пост-MVP операция в транзакции.)
- **Вид данных участников:** владелец видит email участников; editors/viewers видят только displayName.
- **Личные заметки vs совместные данные:** заметки — всегда личные (один владелец, `Note.userId`). Совместность живёт только на уровне списков дел. На дашборде списки разделяются на «Мои» и «Доступные мне».

## 7. API (Server Actions) — операции

Чтения выполняются в Server Components (загрузчики страниц), мутации — Server Actions. Для каждой: вход → выход → права.

**Auth**

| Операция | Вход | Выход | Права |
|---|---|---|---|
| `register({displayName,email,password,code})` | см. §5 | cookie сессии | public |
| `login({email,password})` | — | cookie сессии | public |
| `logout()` | — | очистка cookie | authed |

**Notes** (все — проверка `userId === note.userId`, иначе 404)

| Операция | Вход | Выход |
|---|---|---|
| `createNote({title?,content?,color?})` | — | Note |
| `updateNote(id,{title?,content?,color?})` | — | Note |
| `deleteNote(id)` | — | ok (soft delete) |

**Todo Lists**

| Операция | Вход | Выход | Права |
|---|---|---|---|
| `createList({title})` | — | TodoList + OWNER-членство | authed |
| `updateList(id,{title})` | — | TodoList | OWNER |
| `deleteList(id)` | — | ok (каскад) | OWNER |

**Todo Items** (принадлежность через `item.listId`)

| Операция | Вход | Выход | Права |
|---|---|---|---|
| `addItem(listId,{text})` | — | TodoItem | EDITOR+ |
| `updateItem(id,{text})` | — | TodoItem | EDITOR+ |
| `toggleItem(id)` | — | TodoItem | EDITOR+ |
| `deleteItem(id)` | — | ok | EDITOR+ |
| `reorderItems(listId,{orderedItemIds})` | — | ok (перенумерация в транзакции) | EDITOR+ |

**Members**

| Операция | Вход | Выход | Права |
|---|---|---|---|
| `addMember(listId,{email,role?})` | role = EDITOR | TodoListMember | OWNER |
| `removeMember(listId,{userId})` | — | ok | OWNER |
| `changeMemberRole(listId,{userId,role})` | — | ok | OWNER |

**Admin (invite codes)**

| Операция | Вход | Выход | Права |
|---|---|---|---|
| `createInvitationCode({code?,maxUses?,expiresAt?})` | — | InvitationCode | ADMIN |
| `listInvitationCodes()` | — | InvitationCode[] + useCount | ADMIN |
| `toggleInvitationCode(id)` | — | ok | ADMIN |
| `deleteInvitationCode(id)` | — | ok | ADMIN |

Правило для всех: Server Action = `requireAuth()` → zod-валидация → проверка прав → сервис из `src/server/` → `revalidatePath`.

## 8. План разработки по этапам

### Этап 1. Инициализация

- Next.js (App Router, TS strict, `src/`), Tailwind + shadcn/ui.
- Prisma init, `.env.example`, singleton `lib/prisma.ts`.
- ESLint/Prettier, базовый CI (lint + typecheck + unit).

### Этап 2. База данных

- `schema.prisma` (раздел 4), миграция, seed (ADMIN + dev-коды).

### Этап 3. Авторизация

- `password.ts` (argon2id), `session.ts` (create/verify/destroy/cookie).
- `invitation.ts` (атомарный расход кода).
- Server Actions `register/login/logout`, страницы login/register.
- `requireAuth()` + `(main)` layout.
- Юниты: хеширование, инвайт-логика (лимит/срок/неактивность/гонка), e2e: регистрация→вход→выход.

### Этап 4. Заметки

- Zod-схемы, сервис Notes, CRUD-actions, soft delete.
- UI: грид карточек, создание/редактирование/цвет/удаление.
- Юниты: права (только владелец), e2e: CRUD.

### Этап 5. Списки дел

- Сервис Todos, actions (list/items/reorder), позиции.
- UI: страница списка, add/edit/toggle/delete/reorder.
- Юниты: reorder-транзакции, e2e.

### Этап 6. Совместный доступ

- `access.ts`: `requireMember/Editor/Owner`.
- Members-actions (add by email, remove, changeRole), матрица прав.
- UI: панель участников (владелец), пометка «совместный» на дашборде.
- Юниты: полная матрица прав, e2e: два пользователя/два браузера, синхронизация по reload.

### Этап 7. UI/UX

- Дашборд: вкладки «Заметки» / «Мои списки» / «Совместные», пустые состояния, тосты, респонсив.
- Админ-страница `/admin/invites`.

### Этап 8. Тестирование и безопасность

- Полный e2e-прогон, rate-limit на auth, аудит валидации и прав, заголовки безопасности.

### Этап 9. Deploy

- Vercel + Neon (рекоменд.) или docker-compose (app+postgres).
- `prisma migrate deploy` в CI/CD, секреты, seed админа в проде.

## 9. Зависимости между задачами

```
1 (init) ──► 2 (db) ──► 3 (auth) ─┬─► 4 (notes) ─┐
                                  ├─► 5 (todos) ─┼─► 6 (sharing) ─► 7 (ui) ─► 8 (test/security) ─► 9 (deploy)
                                  └─► admin/приглашения (после 3) ┘
```

- **Последовательно:** 2→3; 6 требует 3 и 5; 8 требует 4–6; 9 — последним.
- **Параллельно:** 4 и 5 (после 3); админ-коды (часть 3) независимы от заметок/списков; этап 7 частично пересекается с 5–6 (полировка дашборда), но полноценно — после 6.
- **Особые правила:** schema.prisma фиксируется на этапе 2 — после этого изменения схемы минимизируются (иначе миграции и параллельные ветки конфликтуют). Тесты прав (этап 6) критичны и не должны урезаться.

## 10. Риски и спорные решения

| Риск/вопрос | Решение MVP | Дальнейшее развитие |
|---|---|---|
| **Необходимость Nest.js** | Не нужен: нет realtime, один контур типов. | Пересмотр при обязательном WebSocket/масштабировании. |
| **Realtime** | Только reload/refetch; БД — источник истины. | SSE через Route Handler (`/api/lists/[id]/events`, стриминг); подписки в памяти → Redis; WebSocket — крайний случай. |
| **Конфликты одновременных изменений** | Last-write-wins (приемлемо для задач/заметок). | Оптимистичная блокировка по `updatedAt`/`version` — показ конфликта. |
| **Reorder-гонки** | Перенумерация в транзакции, последний wins. | `sortOrder` (double/Decimal) со вставкой в середину. |
| **Модель удаления** | Note — soft delete (`deletedAt`), UI корзины позже; TodoList/Item/Member — hard delete с каскадом. | Корзина только для заметок (совместные данные не удалять «по-тихому»). |
| **Управление приглашениями** | `User.role=ADMIN` + `/admin/invites` (создание/лимит/срок/отключение/счётчик). | Ротация кодов, аудит, RBAC-расширение. |
| **Добавление участников по email** | Точный email зарегистрированного пользователя. | Ссылки-приглашения (сущность `ListInvite` + обработка просрочки/отзыва) — пост-MVP. |
| **XSS/CSRF** | Server Actions (same-origin), экранирование React, plain-text содержимое. | Markdown/подсветка — с санитизацией. |
| **Rate-limit** | In-memory счётчик. | Upstash Redis / встроенный лимит платформы. |

**Открытые мелкие решения на время реализации:** разрешить ли EDITOR переименовывать список (MVP: нет, только OWNER); поддержать ли drag-drop reorder в MVP (MVP: up/down-кнопки, drag — по желанию).