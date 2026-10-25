"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { servicesService, type ServiceItem } from "@/services/services.service";

export function ServicesPreview() {
  const [items, setItems] = useState<ServiceItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    servicesService
      .list()
      .then((data) => setItems(data.slice(0, 6)))
      .catch(() => setFailed(true));
  }, []);

  const loading = items === null && !failed;
  const empty = failed || (items !== null && items.length === 0);

  return (
    <section id="services" className="scroll-mt-20 bg-night py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">Каталог</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">Услуги</h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg border border-line bg-surface" />
            ))}

          {items?.map((s) => (
            <article
              key={s.id}
              className="rounded-lg border border-line bg-surface p-6 transition-colors hover:border-nardo hover:bg-surface-2"
            >
              <h3 className="text-lg font-semibold text-fg">{s.name}</h3>
              <p className="mt-4 text-sm text-fg-muted">
                {s.duration_minutes} мин · базовая цена {Number(s.base_price).toLocaleString("ru-RU")}
              </p>
            </article>
          ))}
        </div>

        {empty && (
          <div className="rounded-lg border border-line bg-surface p-8">
            <p className="max-w-md text-fg-muted">
              Актуальный список услуг доступен при онлайн-записи.
            </p>
            <ButtonLink href="/book" variant="accent" size="md" className="mt-6">
              Записаться на сервис
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
