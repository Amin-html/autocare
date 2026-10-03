// services/bays.service.ts
import { api } from "@/lib/api";

export interface Bay {
  id: number;
  name: string;
  is_active: boolean;
}

export const baysService = {
  list: () => api.get<Bay[]>("/bays"),
  listAll: () => api.get<Bay[]>("/bays/all"),
  create: (data: { name: string; is_active?: boolean }) => api.post<Bay>("/bays", data),
  update: (id: number, data: Partial<{ name: string; is_active: boolean }>) =>
    api.patch<Bay>(`/bays/${id}`, data),
  remove: (id: number) => api.delete<void>(`/bays/${id}`),
};