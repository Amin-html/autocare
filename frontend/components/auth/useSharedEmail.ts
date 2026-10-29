"use client";

import { useSyncExternalStore } from "react";

const KEY = "autocare:auth-email";
const listeners = new Set<() => void>();
let memory = ""; // запасной вариант, если sessionStorage недоступен

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): string {
  try {
    return sessionStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function setEmail(value: string) {
  memory = value;
  try {
    sessionStorage.setItem(KEY, value);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/**
 * Email хранится на время сессии, чтобы не терять его при переключении «Вход» ↔ «Регистрация».
 * Пароль нигде не сохраняется.
 */
export function useSharedEmail() {
  const email = useSyncExternalStore(subscribe, getSnapshot, () => "");
  return [email, setEmail] as const;
}
