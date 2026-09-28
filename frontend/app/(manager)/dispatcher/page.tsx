"use client";

import { useCallback, useEffect, useState } from "react";
import {
  appointmentsService,
  Appointment,
  AppointmentStatus,
} from "@/services/appointments.service";
import { baysService, Bay } from "@/services/bays.service";
import { carsService, Car } from "@/services/cars.service";

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const STATUS: Record<
  AppointmentStatus,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "Pending",
    badge: "border border-dark-gray text-medium-gray",
    dot: "bg-medium-gray",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-white text-black",
    dot: "bg-white",
  },
  in_progress: {
    label: "In progress",
    badge: "bg-accent-red text-white",
    dot: "bg-accent-red animate-pulse",
  },
  completed: {
    label: "Completed",
    badge: "bg-dark-gray text-white",
    dot: "bg-medium-gray",
  },
  cancelled: {
    label: "Cancelled",
    badge: "border border-dark-gray text-medium-gray",
    dot: "bg-dark-gray",
  },
};

export default function DispatcherPage() {
  const [date, setDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bays, setBays] = useState<Bay[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const isoDate = toISODate(date);
  const isToday = isoDate === toISODate(new Date());

  const load = useCallback(() => {
    return Promise.all([
      appointmentsService.listAll(isoDate),
      baysService.list(),
      carsService.listAll(),
    ])
      .then(([apptsData, baysData, carsData]) => {
        setAppointments(apptsData);
        setBays(baysData);
        setCars(carsData);
        setError(null);
        setUpdatedAt(new Date());
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setInitialLoading(false));
  }, [isoDate]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  function carOf(carId: number) {
    return cars.find((c) => c.id === carId);
  }

  function carLabel(carId: number) {
    const car = carOf(carId);
    return car ? `${car.make} ${car.model}` : `Car #${carId}`;
  }

  function bayActive(bayId: number) {
    const list = appointments.filter((a) => a.bay_id === bayId);
    return (
      list.find((a) => a.status === "in_progress") ||
      list.find((a) => a.status === "confirmed")
    );
  }

  function bayCount(bayId: number) {
    return appointments.filter(
      (a) => a.bay_id === bayId && a.status !== "cancelled",
    ).length;
  }

  if (initialLoading) {
    return <div className="py-24 text-center text-medium-gray">Loading...</div>;
  }

  if (error && appointments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="label-uppercase text-medium-gray mb-2">Error</p>
        <p className="text-white mb-6">{error}</p>
        <button
          onClick={load}
          className="label-uppercase border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
  );

  const live = appointments.filter((a) => a.status !== "cancelled");
  const stats = [
    { label: "Total", value: live.length },
    {
      label: "In progress",
      value: live.filter((a) => a.status === "in_progress").length,
      accent: true,
    },
    {
      label: "Waiting",
      value: live.filter(
        (a) => a.status === "pending" || a.status === "confirmed",
      ).length,
    },
    {
      label: "Completed",
      value: live.filter((a) => a.status === "completed").length,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="label-uppercase text-medium-gray mb-2">
            Autocare / Operations
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            DISPATCH CENTER
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDate((d) => addDays(d, -1))}
            aria-label="Previous day"
            className="w-10 h-10 border border-dark-gray hover:border-white transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="label-uppercase h-10 px-4 border border-dark-gray hover:border-white transition-colors min-w-40"
          >
            {isToday
              ? "Today"
              : date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
          </button>
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            aria-label="Next day"
            className="w-10 h-10 border border-dark-gray hover:border-white transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-dark-gray border border-dark-gray rounded-md overflow-hidden mb-12">
        {stats.map((s) => (
          <div key={s.label} className="bg-deep-black p-6">
            <p className="label-uppercase text-medium-gray mb-3">{s.label}</p>
            <p
              className={`text-4xl font-bold tabular-nums ${
                s.accent && s.value > 0 ? "text-accent-red" : "text-white"
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Bays */}
      <div className="flex items-baseline justify-between mb-4">
        <p className="label-uppercase text-medium-gray">Bays</p>
        {updatedAt && (
          <p className="text-xs text-medium-gray">
            Updated{" "}
            {updatedAt.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {bays.map((bay) => {
          const active = bayActive(bay.id);
          const car = active ? carOf(active.car_id) : undefined;
          return (
            <div
              key={bay.id}
              className={`border rounded-md p-6 transition-colors ${
                active?.status === "in_progress"
                  ? "border-accent-red"
                  : active
                    ? "border-white"
                    : "border-dark-gray"
              } ${bay.is_active ? "" : "opacity-40"}`}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="label-uppercase text-medium-gray">{bay.name}</p>
                <span
                  className={`w-2 h-2 rounded-full ${
                    active ? STATUS[active.status].dot : "bg-dark-gray"
                  }`}
                />
              </div>

              {!bay.is_active ? (
                <p className="text-medium-gray">Offline</p>
              ) : active ? (
                <>
                  <p className="text-xl font-semibold mb-1">
                    {carLabel(active.car_id)}
                  </p>
                  {car && (
                    <p className="font-mono text-sm text-medium-gray mb-4">
                      {car.plate}
                    </p>
                  )}
                  <p className="font-mono text-sm text-medium-gray">
                    {fmtTime(active.start_at)} – {fmtTime(active.end_at)}
                  </p>
                </>
              ) : (
                <p className="text-xl text-medium-gray">Available</p>
              )}

              <p className="label-uppercase text-medium-gray mt-6 pt-4 border-t border-dark-gray">
                {bayCount(bay.id)} booked
              </p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <p className="label-uppercase text-medium-gray mb-4">Timeline</p>
      <div className="border-t border-dark-gray">
        {sorted.length === 0 ? (
          <p className="text-medium-gray py-8">No appointments for this day.</p>
        ) : (
          sorted.map((appt) => {
            const car = carOf(appt.car_id);
            const cancelled = appt.status === "cancelled";
            return (
              <div
                key={appt.id}
                className={`grid grid-cols-[88px_1fr_auto] md:grid-cols-[120px_1fr_100px_140px] items-center gap-4 md:gap-6 py-5 border-b border-dark-gray ${
                  cancelled ? "opacity-40" : ""
                }`}
              >
                <div className="font-mono text-sm">
                  <p className="text-white">{fmtTime(appt.start_at)}</p>
                  <p className="text-medium-gray">{fmtTime(appt.end_at)}</p>
                </div>

                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {carLabel(appt.car_id)}
                  </p>
                  <p className="text-sm text-medium-gray truncate">
                    {car ? (
                      <span className="font-mono">{car.plate}</span>
                    ) : null}
                    {car && appt.complaint ? " · " : ""}
                    {appt.complaint}
                  </p>
                </div>

                <span className="hidden md:block label-uppercase text-medium-gray text-xs">
                  Bay {appt.bay_id}
                </span>

                <span
                  className={`justify-self-end px-3 py-1 text-xs uppercase tracking-wide rounded-sm whitespace-nowrap ${STATUS[appt.status].badge}`}
                >
                  {STATUS[appt.status].label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
