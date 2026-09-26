// services/services.service.ts
import { api } from "@/lib/api";

export interface ServiceItem {
  id: number;
  name: string;
  base_price: string;
  duration_minutes: number;
}

export const servicesService = {
  list: () => api.get<ServiceItem[]>("/services"),
};