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
  byAppointment: (appointmentId: number) =>
    api.get<WorkOrder | null>(`/work-orders/by-appointment/${appointmentId}`),
  create: (appointmentId: number, mileage: number) =>
    api.post<WorkOrder>(`/work-orders/appointments/${appointmentId}`, { mileage }),
  addItem: (orderId: number, data: { title: string; quantity: number; unit_price: number }) =>
    api.post<WorkOrder>(`/work-orders/${orderId}/items`, data),
  close: (orderId: number) => api.post<WorkOrder>(`/work-orders/${orderId}/close`),
};