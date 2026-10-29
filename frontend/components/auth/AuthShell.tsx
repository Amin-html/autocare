import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { CarIllustration } from "@/components/sections/CarIllustration";
import { findPublicImage } from "@/lib/publicImage";
import { cn } from "@/lib/utils";

type Variant = "login" | "register";

const FEATURES = [
  "Запись на сервис онлайн в любое время",
  "История обслуживания ваших автомобилей",
  "Личный гараж с фотографиями автомобилей",
];

function Tabs({ active }: { active: Variant }) {
  const tab = (href: string, label: string, key: Variant) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={cn(
        "border-b-2 py-3 text-center text-sm font-medium transition-colors",
        active === key ? "border-lime text-lime" : "border-transparent text-fg-muted hover:text-fg"
      )}
    >
      {label}
    </Link>
  );
  return (
    <nav aria-label="Вход или регистрация" className="mb-7 grid grid-cols-2 border-b border-line">
      {tab("/login", "Вход", "login")}
      {tab("/register", "Регистрация", "register")}
    </nav>
  );
}

/**
 * Левая зона. Свои тall-фото: frontend/public/images/auth-login.(jpg|webp|png) и auth-register.*
 * (вертикальный/квадратный кадр, заполняют всю зону). Без них используется hero-car как широкая полоса.
 */
function Visual({ variant }: { variant: Variant }) {
  const custom = findPublicImage("images", variant === "login" ? "auth-login" : "auth-register");
  const band = findPublicImage("images", "hero-car");

  return (
    <>
      {custom ? (
        <Image src={custom} alt="" fill priority sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover" />
      ) : band ? (
        <div className="absolute -left-[30%] top-20 aspect-[945/322] w-[160%] lg:-left-[8%] lg:top-[15%] lg:w-[125%]">
          <Image
            src={band}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 160vw, 65vw"
            className={cn("object-cover", variant === "register" && "object-[75%_center]")}
          />
        </div>
      ) : (
        <div className="absolute inset-x-0 top-20 lg:top-[15%]">
          <CarIllustration className="w-full" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night via-transparent to-night" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-night to-transparent lg:block" />
    </>
  );
}

export function AuthShell({ variant, children }: { variant: Variant; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-night text-fg lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate flex min-h-[380px] flex-col overflow-hidden bg-gradient-to-b from-surface via-[#0B1217] to-night lg:min-h-screen">
        <Visual variant={variant} />

        <div className="relative z-10 p-6 sm:p-8 lg:p-12">
          <Link href="/" aria-label="AutoCare — на главную" className="inline-block">
            <Logo tagline />
          </Link>
        </div>

        <div className="relative z-10 mt-auto p-6 pt-0 sm:p-8 sm:pt-0 lg:p-12 lg:pt-0">
          {variant === "login" ? (
            <>
              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Ваш автомобиль
                <br />
                <span className="text-lime">в надёжных руках</span>
              </h2>
              <p className="mt-4 hidden max-w-md text-sm leading-relaxed text-fg-muted sm:block lg:text-base">
                Войдите в личный кабинет, чтобы записываться на сервис, управлять автомобилями и отслеживать историю
                обслуживания.
              </p>
            </>
          ) : (
            <>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
                <span className="h-px w-8 bg-lime" aria-hidden />
                Регистрация
              </p>
              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Больше возможностей
                <br />с <span className="text-lime">AutoCare</span>
              </h2>
              <ul className="mt-6 hidden space-y-3 sm:block">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-fg-muted lg:text-base">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-surface text-lime">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m3.5 8.5 3 3 6-7" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>

      <main className="relative flex items-start justify-center px-5 py-10 sm:px-8 lg:items-center lg:py-16">
        <div
          className="ac-rise w-full max-w-md rounded-2xl border border-line bg-surface/80 p-6 shadow-[0_0_80px_-30px_rgba(199,255,47,0.25)] backdrop-blur sm:p-8"
          style={{ "--ac-delay": "80ms" } as React.CSSProperties}
        >
          <Tabs active={variant} />
          {children}
        </div>
      </main>
    </div>
  );
}
