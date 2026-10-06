import { api } from "@/lib/api";
import { User } from "@/services/auth.service";

export const usersService = {
  list: () => api.get<User[]>("/users"),
  updateRole: (id: number, role: User["role"]) =>
    api.patch<User>(`/users/${id}/role`, { role }),
  updateProfile: (full_name: string) => api.patch<User>("/users/me", { full_name }),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<User>("/users/me/avatar", formData);
  },
};