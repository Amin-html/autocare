"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  icon: ReactNode;
  error?: string;
  hint?: string;
}

const svg = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const UserIcon = (
  <svg {...svg}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
export const MailIcon = (
  <svg {...svg}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);
export const LockIcon = (
  <svg {...svg}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export function AuthField({ label, icon, error, hint, type = "text", className, ...rest }: AuthFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted">{icon}</span>
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-lg border bg-night/60 py-3 pl-11 text-sm text-fg outline-none transition-colors",
            "placeholder:text-fg-muted/60 focus:ring-2",
            isPassword ? "pr-11" : "pr-4",
            error
              ? "border-danger focus:border-danger focus:ring-danger/25"
              : "border-line hover:border-nardo focus:border-lime focus:ring-lime/25"
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={visible}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-lime"
          >
            <svg {...svg}>
              {visible ? (
                <>
                  <path d="M3 3l18 18" />
                  <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a12 12 0 0 1-2.6 3.3M6.2 7.6C4 9 2.6 10.9 2.5 12c1 2 4.5 6 9.5 6a9.7 9.7 0 0 0 4-.9" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </>
              ) : (
                <>
                  <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
