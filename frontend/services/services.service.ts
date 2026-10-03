// services/services.service.ts
import { api } from "@/lib/api";

export interface ServiceItem {
  id: number;
  name: string;
  base_price: string;
  duration_minutes: number;
  is_active: boolean;
}

export const servicesService = {
  list: () => api.get<ServiceItem[]>("/services"),
  listAll: () => api.get<ServiceItem[]>("/services/all"),
  create: (data: { name: string; base_price: number; duration_minutes: number }) =>
    api.post<ServiceItem>("/services", data),
  update: (id: number, data: Partial<{ name: string; base_price: number; duration_minutes: number; is_active: boolean }>) =>
    api.patch<ServiceItem>(`/services/${id}`, data),
  remove: (id: number) => api.delete<void>(`/services/${id}`),
};