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

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!roles.includes(user.role)) {
      // роль не подходит для этой секции — отправляем в "родной" раздел пользователя
      router.push(roleHome[user.role]);
    }
  }, [user, loading, roles, router]);

  return { user, loading };
}