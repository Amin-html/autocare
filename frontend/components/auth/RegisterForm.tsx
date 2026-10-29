"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { AuthField, LockIcon, MailIcon, UserIcon } from "./AuthField";
import { FormAlert, SubmitButton } from "./AuthParts";
import { useSharedEmail } from "./useSharedEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Errors = { name?: string; email?: string; password?: string; confirm?: string };

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useSharedEmail();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Введите имя";
    if (!email.trim()) next.email = "Введите email";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Введите корректный email";
    if (password.length < MIN_PASSWORD) next.password = `Пароль должен быть не короче ${MIN_PASSWORD} символов`;
    if (confirm !== password) next.confirm = "Пароли не совпадают";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);

    try {
      await register({ email: email.trim(), password, full_name: name.trim() });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось зарегистрироваться. Попробуйте ещё раз.";
      if (/email/i.test(message)) setErrors({ email: message });
      else setFormError(message);
      setIsLoading(false);
      return;
    }

    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch {
      setAccountCreated(true);
      setFormError("Аккаунт создан, но войти автоматически не удалось.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">Создайте аккаунт</h1>
      <p className="mt-2 text-sm text-fg-muted">Зарегистрируйтесь, чтобы записываться на сервис и вести гараж</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-5">
        <AuthField
          label="Имя"
          icon={UserIcon}
          name="name"
          autoComplete="name"
          placeholder="Как к вам обращаться"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <AuthField
          label="Email"
          icon={MailIcon}
          type="email"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
          placeholder="Придумайте пароль"
          hint={`Не короче ${MIN_PASSWORD} символов`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <AuthField
          label="Подтвердите пароль"
          icon={LockIcon}
          type="password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        {formError && (
          <FormAlert>
            {formError}
            {accountCreated && (
              <>
                {" "}
                <Link href="/login" className="font-medium text-lime underline underline-offset-2">
                  Войти вручную
                </Link>
              </>
            )}
          </FormAlert>
        )}
        <SubmitButton loading={isLoading} loadingText="Создаём аккаунт…">
          Зарегистрироваться
        </SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-fg-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-lime transition-colors hover:text-lime-hover">
          Войти
        </Link>
      </p>
    </div>
  );
}
