import { api } from "@/lib/api";

export interface ServiceItem {
  id: number;
  name: string;
  base_price: string;
  duration_minutes: number;
}

export const servicesService = {
  list: () => api.get<ServiceItem[]>("/services"),
  create: (data: { name: string; base_price: number; duration_minutes: number }) =>
    api.post<ServiceItem>("/services", data),
};