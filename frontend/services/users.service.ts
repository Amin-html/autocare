import { api } from "@/lib/api";
import { User } from "@/services/auth.service";

export const usersService = {
  list: () => api.get<User[]>("/users"),
  updateRole: (id: number, role: User["role"]) =>
    api.patch<User>(`/users/${id}/role`, { role }),
};