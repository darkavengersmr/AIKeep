"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <form action={action} className="w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Регистрация</h1>

      {state?.error && (
        <p className="rounded bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm font-medium text-foreground">
          Имя
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          autoComplete="name"
          placeholder="Как к вам обращаться"
          className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        {state?.fieldErrors?.displayName && (
          <p className="text-sm text-danger">{state.fieldErrors.displayName.join(", ")}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        {state?.fieldErrors?.email && (
          <p className="text-sm text-danger">{state.fieldErrors.email.join(", ")}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
          className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        {state?.fieldErrors?.password && (
          <p className="text-sm text-danger">{state.fieldErrors.password.join(", ")}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="code" className="text-sm font-medium text-foreground">
          Код приглашения
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          autoComplete="off"
          placeholder="XXXX-XXXX"
          className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        {state?.fieldErrors?.code && (
          <p className="text-sm text-danger">{state.fieldErrors.code.join(", ")}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand px-3 py-2 font-medium text-foreground transition-colors hover:bg-brand-hover active:bg-brand-pressed disabled:bg-divider disabled:text-subtle disabled:hover:bg-divider"
      >
        {pending ? "Регистрация..." : "Создать аккаунт"}
      </button>

      <p className="text-sm text-muted">
        Уже есть аккаунт?{" "}
        <a className="font-medium text-foreground underline" href="/login">
          Войти
        </a>
      </p>
    </form>
  );
}