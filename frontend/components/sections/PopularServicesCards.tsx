"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { servicesService, type ServiceItem } from "@/services/services.service";
import { ServiceArt, type ServiceArtKind } from "./ServiceArt";

export interface ServiceCardDef {
  key: ServiceArtKind;
  title: string;
  text: string;
  /** Подстроки названия услуги в каталоге (регистр не важен) — по ним берём цену из API. */
  keywords: string[];
  /** URL фотографии из public/images/services, если файл есть. */
  photo: string | null;
}

/** Валюта в БД не хранится. По умолчанию как на странице записи ($); для сомов задайте NEXT_PUBLIC_CURRENCY=сом. */
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "$";

function formatPrice(raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return "";
  const num = n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return CURRENCY.length === 1 ? `${CURRENCY}${num}` : `${num} ${CURRENCY}`;
}

function findService(items: ServiceItem[], keywords: string[]): ServiceItem | undefined {
  return items.find((s) => s.is_active && keywords.some((k) => s.name.toLowerCase().includes(k)));
}

export function PopularServicesCards({ cards }: { cards: ServiceCardDef[] }) {
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    // Тот же источник данных, что и на странице записи; при ошибке карточки остаются без цены.
    servicesService
      .list()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const service = findService(items, card.keywords);
        return (
          <Link
            key={card.key}
            href="/book"
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-lime/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-night">
              {card.photo ? (
                <Image
                  src={card.photo}
                  alt={card.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <ServiceArt
                  kind={card.key}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface to-transparent" />
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold text-fg">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{card.text}</p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div className="min-h-10">
                  {service && (
                    <>
                      <p className="text-sm font-semibold text-lime">от {formatPrice(service.base_price)}</p>
                      <p className="mt-0.5 text-xs text-fg-muted">{service.duration_minutes} мин</p>
                    </>
                  )}
                </div>
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-fg transition-colors duration-300 group-hover:border-lime group-hover:bg-lime group-hover:text-night"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
