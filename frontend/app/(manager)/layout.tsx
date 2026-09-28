"use client";

import { useRequireRole } from "@/hooks/useRole";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { loading, allowed } = useRequireRole(["manager", "admin"]);

  if (loading || !allowed) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return <div className="min-h-screen bg-deep-black text-white">{children}</div>;
}