"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { appointmentsService, Appointment, AppointmentStatus } from "@/services/appointments.service";
import { carsService, Car } from "@/services/cars.service";
import { servicesService, ServiceItem } from "@/services/services.service";
import { StaffStatusBadge } from "@/components/ui/StaffStatus";
import { fmtWhen } from "@/lib/format";

const FILTERS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([appointmentsService.listAll(), carsService.listAll(), servicesService.list()])
      .then(([a, c, s]) => {
        setAppointments(a);
        setCars(c);
        setServices(s);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function carOf(id: number) {
    return cars.find((c) => c.id === id);
  }

  function serviceName(id: number) {
    return services.find((s) => s.id === id)?.name ?? `Service #${id}`;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments
      .filter((a) => filter === "all" || a.status === filter)
      .filter((a) => {
        if (!q) return true;
        const car = carOf(a.car_id);
        return (
          car?.plate.toLowerCase().includes(q) ||
          car?.make.toLowerCase().includes(q) ||
          car?.model.toLowerCase().includes(q) ||
          serviceName(a.service_id).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, cars, services, filter, query]);

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="label-uppercase text-medium-gray mb-2">Autocare / Admin</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">APPOINTMENTS</h1>

      {error && <p className="border border-accent-red rounded-md px-4 py-3 mb-6">{error}</p>}

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`label-uppercase px-4 py-2 border rounded-sm transition-colors ${
                filter === f.value
                  ? "bg-white text-black border-white"
                  : "border-dark-gray text-medium-gray hover:border-white hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          placeholder="Search plate, car, service"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:ml-auto w-full md:w-64 bg-transparent border border-dark-gray focus:border-white outline-none rounded-md px-4 py-2 transition-colors"
        />
      </div>

      <div className="border-t border-dark-gray">
        {filtered.length === 0 ? (
          <p className="text-medium-gray py-8">No appointments match.</p>
        ) : (
          filtered.map((appt) => {
            const car = carOf(appt.car_id);
            return (
              <Link
                key={appt.id}
                href={`/admin/appointments/${appt.id}`}
                className="grid grid-cols-1 md:grid-cols-[160px_1fr_140px_140px] gap-2 md:gap-4 items-center py-4 border-b border-dark-gray hover:bg-white/5 transition-colors px-2 -mx-2 rounded-sm"
              >
                <p className="font-mono text-sm text-medium-gray">{fmtWhen(appt.start_at, appt.end_at)}</p>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {car ? `${car.make} ${car.model}` : `Car #${appt.car_id}`}
                    {car && <span className="font-mono text-sm text-medium-gray ml-3">{car.plate}</span>}
                  </p>
                  <p className="text-sm text-medium-gray truncate">{serviceName(appt.service_id)}</p>
                </div>
                <p className="label-uppercase text-medium-gray text-xs">Bay {appt.bay_id}</p>
                <div className="justify-self-start md:justify-self-end">
                  <StaffStatusBadge status={appt.status} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}