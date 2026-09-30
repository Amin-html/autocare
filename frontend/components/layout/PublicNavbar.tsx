import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PublicNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-white/90 backdrop-blur-sm border-b border-light-gray">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          AUTOCARE
        </Link>
        <div className="flex items-center gap-3 md:gap-6">
          <Link
            href="/login"
            className="label-uppercase text-black hover:text-medium-gray transition-colors text-xs md:text-sm"
          >
            Sign In
          </Link>
          <Link href="/book">
            <Button variant="primary" size="sm">Book Service</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}