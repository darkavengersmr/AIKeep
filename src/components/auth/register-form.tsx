"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <form action={action} className="w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Регистрация</h1>

      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm font-medium">
          Имя
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
        {state?.fieldErrors?.displayName && (
          <p className="text-sm text-red-600">{state.fieldErrors.displayName.join(", ")}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
        {state?.fieldErrors?.email && (
          <p className="text-sm text-red-600">{state.fieldErrors.email.join(", ")}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
        {state?.fieldErrors?.password && (
          <p className="text-sm text-red-600">{state.fieldErrors.password.join(", ")}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="code" className="text-sm font-medium">
          Код приглашения
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          autoComplete="off"
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
        {state?.fieldErrors?.code && (
          <p className="text-sm text-red-600">{state.fieldErrors.code.join(", ")}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-zinc-900 px-3 py-2 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Регистрация..." : "Создать аккаунт"}
      </button>

      <p className="text-sm text-zinc-600">
        Уже есть аккаунт?{" "}
        <a className="text-zinc-900 underline" href="/login">
          Войти
        </a>
      </p>
    </form>
  );
}