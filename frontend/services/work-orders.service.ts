import { api } from "@/lib/api";

export interface WorkItem {
  id: number;
  title: string;
  quantity: number;
  unit_price: string;
}

export interface WorkOrder {
  id: number;
  appointment_id: number;
  mileage: number;
  status: "open" | "closed";
  total: string;
  items: WorkItem[];
}

export const workOrdersService = {
  get: (id: number) => api.get<WorkOrder>(`/work-orders/${id}`),
};