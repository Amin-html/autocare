"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ROLE_HOME = {
  client: "/dashboard",
  manager: "/dispatcher",
  master: "/work",
  admin: "/admin",
} as const;

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const links = [
    { href: "/", label: "Главная" },
    { href: "/#services", label: "Услуги" },
    ...(user?.role === "client"
      ? [
          { href: "/garage", label: "Гараж" },
          { href: "/appointments", label: "Записи" },
        ]
      : []),
    ...(user && user.role !== "client" ? [{ href: ROLE_HOME[user.role], label: "Кабинет" }] : []),
  ];
  const canBook = !user || user.role === "client";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logo = (
    <span className="text-lg font-bold tracking-tight text-fg">
      AUTO<span className="text-lime">CARE</span>
    </span>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-night/80 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-6">
          <Link href="/" aria-label="AutoCare — на главную">{logo}</Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Основная навигация">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-sm transition-colors",
                    active ? "text-fg" : "text-fg-muted hover:text-fg"
                  )}
                >
                  {l.label}
                  {active && <span className="absolute inset-x-0 -bottom-px h-px bg-lime" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            {loading ? (
              <div className="h-9 w-28" aria-hidden />
            ) : user ? (
              <>
                <Link href="/profile" aria-label="Профиль" className="rounded-full ring-1 ring-line">
                  <Avatar src={user.avatar_url} name={user.full_name || "?"} size={34} />
                </Link>
                <button onClick={logout} className="text-sm text-fg-muted transition-colors hover:text-fg">
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm text-fg-muted transition-colors hover:text-fg">
                Войти
              </Link>
            )}
            {canBook && (
              <ButtonLink href="/book" size="md">
                Записаться
              </ButtonLink>
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
            className="-mr-2 flex flex-col gap-1.5 p-2 md:hidden"
          >
            <span className="block h-px w-6 bg-fg" />
            <span className="block h-px w-6 bg-fg" />
            <span className="block h-px w-4 self-end bg-lime" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col border-l border-line bg-surface p-6">
            <div className="mb-10 flex items-center justify-between">
              {logo}
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
                className="-mr-2 p-2 text-2xl leading-none text-fg"
              >
                ×
              </button>
            </div>

            {user && (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="mb-8 flex items-center gap-3"
              >
                <span className="rounded-full ring-1 ring-line">
                  <Avatar src={user.avatar_url} name={user.full_name || "?"} size={36} />
                </span>
                <span className="text-sm text-fg-muted">{user.full_name}</span>
              </Link>
            )}

            <nav className="mb-10 flex flex-col gap-5">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-lg transition-colors",
                    pathname === l.href ? "text-lime" : "text-fg hover:text-lime"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              {canBook && (
                <ButtonLink href="/book" onClick={() => setOpen(false)}>
                  Записаться
                </ButtonLink>
              )}
              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="py-2 text-sm text-fg-muted transition-colors hover:text-fg"
                >
                  Выйти
                </button>
              ) : (
                <ButtonLink href="/login" variant="outline-light" onClick={() => setOpen(false)}>
                  Войти
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
