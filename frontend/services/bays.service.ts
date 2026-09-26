// services/bays.service.ts
import { api } from "@/lib/api";

export interface Bay {
  id: number;
  name: string;
  is_active: boolean;
}

export const baysService = {
  list: () => api.get<Bay[]>("/bays"),
};