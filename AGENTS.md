<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AIKeep

Приложение для заметок в стиле Google Keep с совместными списками задач.
Стек: Next.js 16 (App Router, Server Actions), React 19, TypeScript 5 (strict), Tailwind CSS v4, Prisma 6 + PostgreSQL, Zod 4, Argon2id. UI — на русском языке.

## Тесты писать не нужно

Не создавай и не прави юнит/интеграционные тесты (Vitest), даже если задача похожа на тестируемую. Вместо этого **обязательно проверяй** после изменений:

- `npm run lint`
- `npm run typecheck`
- `npm run build` (для влияющих на прод-сборку изменений)

Тесты в `tests/` не трогай без явной просьбы.

## Архитектура

Строгое разделение слоёв (см. `docs/PLAN.md`):

- `src/server/` — вся бизнес-логика (auth, notes, todos, members, admin, access, validation). **Здесь нет ни одного импорта из Next.js** — только Prisma и собственные lib. Сервисы возвращают данные или бросают `ApiError`.
- `src/actions/` — тонкие Server Actions (`"use server"`): `requireAuth()` → Zod-валидация → вызов сервиса → `revalidatePath` / `redirect`. Не содержит бизнес-логики.
- `src/app/` — роуты: `(auth)` (login/register), `(main)` (дашборд, `requireAuth` в layout), `admin` (только ADMIN).
- `src/components/` — React-компоненты (формы через `useActionState`, тосты).
- `src/lib/` — Prisma-синглтон, хелперы аутентификации, модель ошибок, константы цветов.

Импорты — через алиас `@/` (маппинг на `src/`).

## Конвенции

- **Права доступа** проверяются дважды: на уровне роута (redirect) и повторно в каждом сервисе/actions (throw `ApiError`, 403). Владелец списка — участник с ролью `OWNER` в `TodoListMember`, отдельного `ownerId` нет.
- **Ошибки** (`src/lib/errors.ts`): сервисы бросают `ApiError(message, status, code?)`; actions перехватывают и возвращают `{ error }` или `{ fieldErrors }` (через `isApiError`), непойманные ошибки пробрасываются.
- **Валидация** — только через Zod-схемы из `src/server/validation/schemas.ts`; в actions использовать `safeParse` + `flatten()`.
- **Комментарии в коде** не пиши (в проекте их почти нет).
- **Сообщения/UI** — на русском. Палитра цветов заметок — в `src/lib/note-colors.ts` (белый, жёлтый, зелёный, синий, фиолетовый, розовый, оранжевый).
- **Заметки** — личные, soft delete (`deletedAt`); **TodoItem/TodoListMember** — hard delete; `TodoList` — hard delete с каскадом. Реордер задач — перенумерация `position` в одной транзакции.
- Мутации — Server Actions, чтения — Server Components. Realtime нет, синхронизация через reload/refetch.

## Работа с БД (Prisma)

- Схема — `prisma/schema.prisma`. После изменения схемы: `npm run db:migrate`, затем regenerate клиента (`npx prisma generate`) и перепроверить `npm run typecheck`.
- Схему менять минимально (миграции конфликтуют), см. `docs/PLAN.md` §9.
- Seed: `npm run db:seed` (создаёт ADMIN и инвайт-код из `.env`). Локальный Postgres: `docker compose up -d`.
