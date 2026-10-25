import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-night py-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 md:flex-row md:items-center">
        <p className="text-sm text-fg-muted">© 2026 AutoCare. Точность в каждом обслуживании.</p>
        <nav className="flex gap-6 text-sm text-fg-muted">
          <Link href="/book" className="transition-colors hover:text-fg">Записаться</Link>
          <Link href="/login" className="transition-colors hover:text-fg">Войти</Link>
          <Link href="/register" className="transition-colors hover:text-fg">Регистрация</Link>
        </nav>
      </div>
    </footer>
  );
}
