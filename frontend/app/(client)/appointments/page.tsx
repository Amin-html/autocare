"use client";

import { useEffect, useState } from "react";
import { appointmentsService, Appointment } from "@/services/appointments.service";
import { AppointmentCard } from "@/components/ui/AppointmentCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    appointmentsService
      .my()
      .then(setAppointments)
      .catch(setError)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCancel(id: number) {
    setCancellingId(id);
    setCancelError(null);
    try {
      await appointmentsService.cancel(id);
      load();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Could not cancel this appointment.");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="pb-24">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-9 w-56 mb-8" />
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={load} />;

  const upcoming = appointments
    .filter((a) => ["pending", "confirmed", "in_progress"].includes(a.status))
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const history = appointments
    .filter((a) => ["completed", "cancelled"].includes(a.status))
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  const list = tab === "upcoming" ? upcoming : history;

  return (
    <div className="pb-24">
      <p className="label-uppercase text-medium-gray mb-2">Autocare</p>
      <h1 className="text-3xl font-bold mb-8">APPOINTMENTS</h1>

      <div className="flex gap-8 border-b border-light-gray mb-8">
        {(["upcoming", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "label-uppercase pb-4 border-b-2 -mb-px transition-colors",
              tab === t ? "border-black text-black" : "border-transparent text-medium-gray"
            )}
          >
            {t === "upcoming" ? "Upcoming" : "History"}
          </button>
        ))}
      </div>

      {cancelError && <p className="text-accent-red text-sm mb-6">{cancelError}</p>}

      {list.length > 0 ? (
        <div className="flex flex-col gap-4">
          {list.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onCancel={tab === "upcoming" ? handleCancel : undefined}
              cancelling={cancellingId === appt.id}
            />
          ))}
        </div>
      ) : (
        <p className="text-medium-gray text-center py-12">
          {tab === "upcoming" ? "No upcoming appointments." : "No past appointments."}
        </p>
      )}
    </div>
  );
}