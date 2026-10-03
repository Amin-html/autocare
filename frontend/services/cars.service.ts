import { api } from "@/lib/api";

export interface Car {
  id: number;
  owner_id: number;
  make: string;
  model: string;
  year: number;
  plate: string;
  mileage: number;
}

export const carsService = {
  list: () => api.get<Car[]>("/cars"),
  listAll: () => api.get<Car[]>("/cars/all"),
  get: (id: number) => api.get<Car>(`/cars/${id}`),
  create: (data: Omit<Car, "id" | "owner_id">) => api.post<Car>("/cars", data),
  update: (id: number, data: Partial<Omit<Car, "id" | "owner_id">>) =>
    api.patch<Car>(`/cars/${id}`, data),
  remove: (id: number) => api.delete<void>(`/cars/${id}`),
};