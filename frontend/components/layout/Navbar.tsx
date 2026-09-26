import Link from "next/link";
import { Button } from "@/components/ui/Button";


export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-white/90 backdrop-blur-sm border-b border-light-gray">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          AUTOCARE
        </Link>
        <nav className="hidden md:flex items-center gap-8 label-uppercase text-black">
          <Link href="/garage" className="hover:text-medium-gray transition-colors">Garage</Link>
          <Link href="/services" className="hover:text-medium-gray transition-colors">Services</Link>
          <Link href="/appointments" className="hover:text-medium-gray transition-colors">Appointments</Link>
          <Link href="/history" className="hover:text-medium-gray transition-colors">History</Link>
        </nav>
        <Link href="/book">
          <Button variant="primary" size="sm">Book Service</Button>
        </Link>
        {/* mobile: показать только logo + burger — добавим Drawer в PHASE 13 */}
      </div>
    </header>
  );
}