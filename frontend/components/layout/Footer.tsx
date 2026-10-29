import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { CONTACTS, SOCIALS } from "@/lib/site";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/#services", label: "Услуги" },
  { href: "/garage", label: "Гараж" },
  { href: "/appointments", label: "Записи" },
  { href: "/history", label: "История" },
  { href: "/profile", label: "Профиль" },
];

export function Footer() {
  const hasContacts = Boolean(CONTACTS.address || CONTACTS.phone || CONTACTS.email);

  return (
    <footer className="border-t border-line bg-night">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1fr_auto_auto] md:items-start">
        <div>
          <Link href="/" aria-label="AutoCare — на главную">
            <Logo />
          </Link>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-fg-muted">Premium car service</p>
        </div>

        <nav aria-label="Навигация в подвале" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-fg-muted md:max-w-sm">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>

        {(hasContacts || SOCIALS.length > 0) && (
          <div className="space-y-3 text-sm text-fg-muted">
            {CONTACTS.address && <p>{CONTACTS.address}</p>}
            {CONTACTS.phone && (
              <p>
                <a href={`tel:${CONTACTS.phone.replace(/[^\d+]/g, "")}`} className="transition-colors hover:text-fg">
                  {CONTACTS.phone}
                </a>
              </p>
            )}
            {CONTACTS.email && (
              <p>
                <a href={`mailto:${CONTACTS.email}`} className="transition-colors hover:text-fg">
                  {CONTACTS.email}
                </a>
              </p>
            )}
            {SOCIALS.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-lime">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-6 py-5 text-xs text-fg-muted">
          © {new Date().getFullYear()} AutoCare. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
