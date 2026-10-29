import Link from "next/link";
import { findPublicImage } from "@/lib/publicImage";
import { PopularServicesCards, type ServiceCardDef } from "./PopularServicesCards";

/** Фото кладите в frontend/public/images/services/<key>.(jpg|webp|png): diagnostics, oil, brakes, tires. */
const BASE: Omit<ServiceCardDef, "photo">[] = [
  { key: "diagnostics", title: "Компьютерная диагностика", text: "Проверка электронных систем автомобиля.", keywords: ["диагност"] },
  { key: "oil", title: "Замена масла", text: "Своевременная замена масла и фильтров.", keywords: ["масл"] },
  { key: "brakes", title: "Тормозная система", text: "Диагностика и ремонт тормозной системы.", keywords: ["тормоз"] },
  { key: "tires", title: "Шиномонтаж", text: "Сезонная замена и балансировка колёс.", keywords: ["шин"] },
];

export function PopularServices() {
  const cards: ServiceCardDef[] = BASE.map((c) => ({ ...c, photo: findPublicImage("images/services", c.key) }));

  return (
    <section id="services" className="scroll-mt-20 bg-night py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              <span className="h-px w-8 bg-lime" aria-hidden />
              Популярные услуги
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">Всё для вашего автомобиля</h2>
          </div>
          <Link href="/book" className="text-sm text-fg-muted transition-colors hover:text-lime">
            Все услуги →
          </Link>
        </div>
        <PopularServicesCards cards={cards} />
      </div>
    </section>
  );
}
