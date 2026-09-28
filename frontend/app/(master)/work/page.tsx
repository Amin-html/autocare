"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appointmentsService, Appointment } from "@/services/appointments.service";
import { carsService, Car } from "@/services/cars.service";
import { servicesService, ServiceItem } from "@/services/services.service";
import { StaffStatusBadge } from "@/components/ui/StaffStatus";
import { fmtWhen } from "@/lib/format";

export default function WorkPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([appointmentsService.assigned(), carsService.listAll(), servicesService.list()])
      .then(([a, c, s]) => {
        setAppointments(a);
        setCars(c);
        setServices(s);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function startWork(id: number) {
    setBusyId(id);
    setError(null);
    appointmentsService
      .start(id)
      .then(() => router.push(`/work/${id}`))
      .catch((err: Error) => {
        setError(err.message);
        setBusyId(null);
      });
  }

  function carOf(id: number) {
    return cars.find((c) => c.id === id);
  }

  function serviceName(id: number) {
    return services.find((s) => s.id === id)?.name ?? `Service #${id}`;
  }

  function renderJob(appt: Appointment) {
    const car = carOf(appt.car_id);
    return (
      <div
        key={appt.id}
        className={`border rounded-md p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 ${
          appt.status === "in_progress" ? "border-accent-red" : "border-dark-gray"
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm text-medium-gray mb-2">
            {fmtWhen(appt.start_at, appt.end_at)} · Bay {appt.bay_id}
          </p>
          <p className="text-xl font-semibold">
            {car ? `${car.make} ${car.model}` : `Car #${appt.car_id}`}
            {car && <span className="font-mono text-sm text-medium-gray ml-3">{car.plate}</span>}
          </p>
          <p className="text-medium-gray mt-1">{serviceName(appt.service_id)}</p>
          {appt.complaint && <p className="text-sm text-medium-gray mt-2">“{appt.complaint}”</p>}
        </div>

        <div className="flex items-center gap-4">
          <StaffStatusBadge status={appt.status} />
          {appt.status === "confirmed" ? (
            <button
              onClick={() => startWork(appt.id)}
              disabled={busyId === appt.id}
              className="label-uppercase bg-white text-black px-5 py-3 hover:bg-light-gray transition-colors disabled:opacity-40"
            >
              {busyId === appt.id ? "Starting..." : "Start work"}
            </button>
          ) : (
            <Link
              href={`/work/${appt.id}`}
              className="label-uppercase border border-dark-gray px-5 py-3 hover:border-white transition-colors"
            >
              {appt.status === "in_progress" ? "Open order" : "View"}
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  const inProgress = appointments.filter((a) => a.status === "in_progress");
  const upNext = appointments.filter((a) => a.status === "confirmed");
  const done = appointments
    .filter((a) => a.status === "completed")
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
    .slice(0, 10);

  const sections = [
    { title: "In progress", items: inProgress },
    { title: "Up next", items: upNext },
    { title: "Recently completed", items: done },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="label-uppercase text-medium-gray mb-2">Autocare / Workshop</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-10">MY JOBS</h1>

      {error && (
        <p className="border border-accent-red text-white rounded-md px-4 py-3 mb-8">{error}</p>
      )}

      {appointments.length === 0 && !error ? (
        <p className="text-medium-gray">No jobs assigned to you yet.</p>
      ) : (
        sections.map(
          (s) =>
            s.items.length > 0 && (
              <section key={s.title} className="mb-12">
                <p className="label-uppercase text-medium-gray mb-4">
                  {s.title} · {s.items.length}
                </p>
                <div className="flex flex-col gap-3">{s.items.map(renderJob)}</div>
              </section>
            )
        )
      )}
    </div>
  );
}