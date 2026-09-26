"use client";

import { useRequireRole } from "@/hooks/useRole";
import { Navbar } from "@/components/layout/Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireRole(["client"]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-6">{children}</div>
    </>
  );
}