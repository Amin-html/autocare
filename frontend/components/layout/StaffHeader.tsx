"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface StaffHeaderProps {
  section: string;
  links?: { href: string; label: string }[];
}

export function StaffHeader({ section, links }: StaffHeaderProps) {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-dark-gray">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-tight">AUTOCARE</span>
          <span className="label-uppercase text-medium-gray">{section}</span>
          {links && links.length > 0 && (
            <nav className="hidden md:flex items-center gap-5">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="label-uppercase text-medium-gray hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-medium-gray hidden sm:block">{user?.full_name}</span>
          <button
            onClick={logout}
            className="label-uppercase hover:text-medium-gray transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}