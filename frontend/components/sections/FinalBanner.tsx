import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { findPublicImage } from "@/lib/publicImage";
import { CarIllustration } from "./CarIllustration";

/** Фото баннера: frontend/public/images/banner-car.(jpg|webp|png). Без файла — иллюстрация на тёмном фоне. */
export function FinalBanner() {
  const photo = findPublicImage("images", "banner-car");

  return (
    <section className="bg-night pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative isolate flex flex-col overflow-hidden rounded-2xl border border-line bg-surface lg:min-h-[340px] lg:flex-row lg:items-center">
          <div className="relative z-10 p-8 sm:p-12 lg:w-1/2">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              <span className="h-px w-8 bg-lime" aria-hidden />
              AutoCare
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
              Ваш автомобиль
              <br />в надёжных руках
            </h2>
            <p className="mt-4 max-w-md text-fg-muted">
              Запишитесь на сервис и управляйте обслуживанием автомобиля в одном месте.
            </p>
            <ButtonLink href="/book" className="mt-8">
              Записаться на сервис
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </ButtonLink>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-b from-surface to-night lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[65%] lg:bg-none">
            {photo ? (
              <Image
                src={photo}
                alt="Автомобиль"
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover object-[70%_center]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="ac-glow absolute left-1/2 top-1/2 h-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-3xl" />
                <CarIllustration className="relative w-full max-w-none lg:w-[110%]" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface via-transparent to-transparent lg:hidden" />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-surface via-surface/70 to-transparent lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
