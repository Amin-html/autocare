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

/** Высокая/квадратная фотография на всю левую зону: frontend/public/images/auth-login.(jpg|webp|png) и auth-register.* */
function FullBleedPhoto({ src }: { src: string }) {
  return (
    <>
      <Image src={src} alt="" fill priority sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night/80 via-transparent to-night" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night/60 via-transparent to-transparent" />
    </>
  );
}

/** Широкое фото (hero-car) — в аккуратной карточке с рамкой и свечением, без растяжения. */
function PhotoCard({ src }: { src: string | null }) {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-lime/10 blur-3xl" />
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] lg:aspect-[21/10]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-[52%_center]"
          />
        ) : (
          <CarIllustration className="h-full w-full" />
        )}
        {/* нижний градиент заодно скрывает надпись, вшитую в фотографию */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-night via-night/70 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
      </div>
    </div>
  );
}

export function AuthShell({ variant, children }: { variant: Variant; children: ReactNode }) {
  const custom = findPublicImage("images", variant === "login" ? "auth-login" : "auth-register");
  const card = findPublicImage("images", "hero-car");

  const heading =
    variant === "login" ? (
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
    );

  return (
    <div className="min-h-screen bg-night text-fg lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate flex flex-col overflow-hidden bg-night p-5 sm:p-8 lg:min-h-screen lg:p-12">
        {custom ? (
          <FullBleedPhoto src={custom} />
        ) : (
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 -z-10 h-96 w-96 rounded-full bg-lime/[0.06] blur-3xl" />
        )}

        <Link href="/" aria-label="AutoCare — на главную" className="relative z-10 inline-block self-start">
          <Logo tagline />
        </Link>

        {custom ? (
          <div className="relative z-10 mt-auto pt-48 lg:pt-0">{heading}</div>
        ) : (
          <div className="relative z-10 mt-8 w-full max-w-xl lg:my-auto lg:py-10">
            <PhotoCard src={card} />
            <div className="mt-7 lg:mt-9">{heading}</div>
          </div>
        )}
      </aside>

      <main className="relative flex items-start justify-center px-5 pb-12 pt-2 sm:px-8 lg:items-center lg:py-16">
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
