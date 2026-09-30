"use client";

import { useRequireRole } from "@/hooks/useRole";
import { ClientNavbar } from "@/components/layout/ClientNavbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireRole(["client"]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <ClientNavbar />
      <div className="pt-24 max-w-6xl mx-auto px-6">{children}</div>
    </>
  );
}