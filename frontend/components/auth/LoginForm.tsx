"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthField, LockIcon, MailIcon } from "./AuthField";
import { FormAlert, SubmitButton } from "./AuthParts";
import { useSharedEmail } from "./useSharedEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [email, setEmail] = useSharedEmail();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    const next: typeof errors = {};
    if (!email.trim()) next.email = "Введите email";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Введите корректный email";
    if (!password) next.password = "Введите пароль";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard"); // как и раньше; загрузка остаётся включённой до перехода
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Не удалось войти. Попробуйте ещё раз.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">Добро пожаловать</h1>
      <p className="mt-2 text-sm text-fg-muted">Войдите в свой аккаунт, чтобы продолжить</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-5">
        <AuthField
          label="Email"
          icon={MailIcon}
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <AuthField
          label="Пароль"
          icon={LockIcon}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        {formError && <FormAlert>{formError}</FormAlert>}
        <SubmitButton loading={isLoading} loadingText="Входим…">
          Войти
        </SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-fg-muted">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-lime transition-colors hover:text-lime-hover">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
