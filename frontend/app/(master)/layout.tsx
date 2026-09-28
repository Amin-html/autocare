"use client";

import { useRequireRole } from "@/hooks/useRole";
import { StaffHeader } from "@/components/layout/StaffHeader";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const { loading, allowed } = useRequireRole(["master", "admin"]);

  if (loading || !allowed) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white">
      <StaffHeader section="Workshop" />
      {children}
    </div>
  );
}