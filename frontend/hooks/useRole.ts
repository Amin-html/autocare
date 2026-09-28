"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/services/auth.service";

const roleHome: Record<User["role"], string> = {
  client: "/dashboard",
  manager: "/dispatcher",
  master: "/work",
  admin: "/admin",
};

export function useRequireRole(roles: User["role"][]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const allowed = !!user && roles.includes(user.role);
  const rolesKey = roles.join(",");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!allowed) {
      router.push(roleHome[user.role]);
    }
  }, [user, loading, allowed, rolesKey, router]);

  return { user, loading, allowed };
}