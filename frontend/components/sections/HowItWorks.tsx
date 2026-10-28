import type { ReactNode } from "react";

const iconProps = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const STEPS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "Выберите услугу",
    text: "Определите нужную услугу и автомобиль из вашего гаража.",
    icon: (
      <svg {...iconProps}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5h6M9 10l1.5 1.5L13 9M9 16h6" />
      </svg>
    ),
  },
  {
    title: "Запишитесь онлайн",
    text: "Выберите удобную дату и время в календаре.",
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
        <circle cx="12" cy="15" r="1.4" />
      </svg>
    ),
  },
  {
    title: "Приезжайте в сервис",
    text: "Приезжайте в выбранное время, запись и детали всегда под рукой.",
    icon: (
      <svg {...iconProps}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3.5 17.2a1.9 1.9 0 0 0 2.7 2.7l5.8-5.8a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.1-.5-.5-2.1z" />
      </svg>
    ),
  },
  {
    title: "Получите результат",
    text: "Следите за статусом и смотрите историю обслуживания в кабинете.",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.7 2.7L16 9.5" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-line bg-night py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">Процесс</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">Как это работает</h2>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="group relative border-t border-line pt-8">
              {/* лаймовый акцент поверх линии */}
              <span
                aria-hidden
                className="absolute -top-px left-0 h-px w-10 bg-lime transition-all duration-300 group-hover:w-20"
              />
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-surface text-xs font-semibold tracking-wider text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-fg-muted transition-colors duration-300 group-hover:text-lime">
                  {step.icon}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-fg">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
