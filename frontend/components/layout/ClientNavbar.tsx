"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

const LINKS = [
  { href: "/garage", label: "Garage" },
  { href: "/appointments", label: "Appointments" },
  { href: "/history", label: "History" },
];

export function ClientNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-warm-white/90 backdrop-blur-sm border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            AUTOCARE
          </Link>

          <nav className="hidden md:flex items-center gap-8 label-uppercase text-black">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "hover:text-medium-gray transition-colors",
                  pathname === l.href && "text-medium-gray"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/book">
            <Button variant="primary" size="sm">Book Service</Button>
          </Link>
          <Link href="/profile" aria-label="Profile">
            <Avatar src={user?.avatar_url} name={user?.full_name || "?"} size={32} />
          </Link>
          <button
            onClick={logout}
            className="label-uppercase text-medium-gray hover:text-black transition-colors"
          >
            Sign out
          </button>
        </div>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
          >
            <span className="block w-6 h-px bg-black" />
            <span className="block w-6 h-px bg-black" />
            <span className="block w-6 h-px bg-black" />
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-warm-white border-l border-light-gray p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="text-lg font-bold tracking-tight">AUTOCARE</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {user && (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 mb-6"
              >
                <Avatar src={user.avatar_url} name={user.full_name} size={36} />
                <span className="text-sm text-medium-gray">{user.full_name}</span>
              </Link>
            )}

            <nav className="flex flex-col gap-6 label-uppercase mb-10">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "transition-colors",
                    pathname === l.href ? "text-black" : "text-medium-gray hover:text-black"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <Link href="/book" onClick={() => setOpen(false)} className="mt-auto">
              <Button variant="primary" size="md" className="w-full mb-4">
                Book Service
              </Button>
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="label-uppercase text-medium-gray hover:text-black transition-colors text-left"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}