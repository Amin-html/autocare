"use client";

import { useRequireRole } from "@/hooks/useRole";
import { StaffHeader } from "@/components/layout/StaffHeader";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/appointments", label: "Appointments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, allowed } = useRequireRole(["admin"]);

  if (loading || !allowed) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <StaffHeader section="Admin" links={ADMIN_LINKS} />
      {children}
    </div>
  );
}