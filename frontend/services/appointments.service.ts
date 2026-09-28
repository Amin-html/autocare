import { api } from "@/lib/api";

export type AppointmentStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface Appointment {
  id: number;
  client_id: number;
  car_id: number;
  service_id: number;
  bay_id: number;
  master_id: number | null;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  complaint: string | null;
}

export const appointmentsService = {
  my: () => api.get<Appointment[]>("/appointments/my"),
  assigned: () => api.get<Appointment[]>("/appointments/assigned"),
  listAll: (onDate?: string) =>
    api.get<Appointment[]>(`/appointments${onDate ? `?on_date=${onDate}` : ""}`),
  create: (data: {
    car_id: number;
    service_id: number;
    bay_id: number;
    start_at: string;
    complaint?: string;
  }) => api.post<Appointment>("/appointments", data),
  cancel: (id: number) => api.post<Appointment>(`/appointments/${id}/cancel`),
  confirm: (id: number, masterId?: number) =>
    api.post<Appointment>(`/appointments/${id}/confirm${masterId ? `?master_id=${masterId}` : ""}`),
  start: (id: number) => api.post<Appointment>(`/appointments/${id}/start`),
};