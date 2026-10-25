import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroVisual } from "./HeroVisual";

const HIGHLIGHTS = [
  { title: "Онлайн-запись", text: "Выберите автомобиль, услугу и удобное время." },
  { title: "Личный гараж", text: "Ваши автомобили и фотографии в одном кабинете." },
  { title: "История обслуживания", text: "Выполненные работы по каждому визиту." },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night pt-[72px]">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-12 lg:py-20">
        <div className="max-w-xl">
          <p
            className="ac-rise mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted"
            style={{ "--ac-delay": "0ms" } as React.CSSProperties}
          >
            <span className="h-px w-8 bg-lime" aria-hidden />
            Premium car service
          </p>
          <h1
            className="ac-rise text-[clamp(2.5rem,6.2vw,4.75rem)] font-bold leading-[1.04] tracking-[-0.025em] text-fg"
            style={{ "--ac-delay": "100ms" } as React.CSSProperties}
          >
            Точность
            <br />в каждом <span className="text-lime">обслуживании</span>
          </h1>
          <p
            className="ac-rise mt-6 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg"
            style={{ "--ac-delay": "220ms" } as React.CSSProperties}
          >
            Запись в автосервис онлайн, личный гараж и история обслуживания вашего автомобиля — в одном месте.
          </p>
          <div
            className="ac-rise mt-10 flex flex-col gap-3 sm:flex-row"
            style={{ "--ac-delay": "340ms" } as React.CSSProperties}
          >
            <ButtonLink href="/book" variant="accent">
              Записаться на сервис
            </ButtonLink>
            <ButtonLink href="/#services" variant="outline-light">
              Услуги
            </ButtonLink>
          </div>
        </div>
      </div>

      <HeroVisual />

      <div className="relative z-10 border-t border-line bg-night/70 backdrop-blur-md">
        <ul className="mx-auto grid max-w-7xl gap-px px-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="py-5 sm:py-6 sm:pr-8">
              <p className="text-sm font-semibold text-fg">{h.title}</p>
              <p className="mt-1 text-sm text-fg-muted">{h.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
