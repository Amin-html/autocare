"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { carsService, Car } from "@/services/cars.service";
import { appointmentsService, Appointment } from "@/services/appointments.service";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

export default function DashboardPage() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  function load() {
    if (!user || user.role !== "client") return;
    setLoading(true);
    setError(null);
    Promise.all([carsService.list(), appointmentsService.my()])
      .then(([carsData, apptsData]) => {
        setCars(carsData);
        setAppointments(apptsData);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }

  useEffect(load, [user]);

  if (loading) {
    return (
      <div className="pb-24">
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="h-3 w-28 mb-4" />
        <Skeleton className="h-40 w-full mb-12" />
        <Skeleton className="h-3 w-40 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={load} />;

  const myCar = cars[0];
  const upcoming = appointments.filter((a) =>
    ["pending", "confirmed", "in_progress"].includes(a.status)
  );

  return (
    <div className="pb-24">
      <p className="text-medium-gray mb-2">Good morning, {user?.full_name}.</p>

      <p className="label-uppercase text-medium-gray mb-4">Your Garage</p>
      {myCar ? (
        <div className="border border-light-gray rounded-md p-8 mb-12">
          <h2 className="text-3xl font-bold mb-2">{myCar.make} {myCar.model}</h2>
          <p className="text-medium-gray">{myCar.mileage.toLocaleString()} KM</p>
          <Button variant="secondary" size="md" className="mt-6">Book Service</Button>
        </div>
      ) : (
        <div className="border border-light-gray rounded-md p-8 mb-12 text-center text-medium-gray">
          No vehicles yet. Add your first car to get started.
        </div>
      )}

      <p className="label-uppercase text-medium-gray mb-4">Upcoming Appointment</p>
      {upcoming.length > 0 ? (
        <div className="flex flex-col gap-4">
          {upcoming.map((appt) => (
            <div key={appt.id} className="border border-light-gray rounded-md p-6 flex justify-between items-center">
              <div>
                <p className="font-medium">{new Date(appt.start_at).toLocaleString()}</p>
                <p className="text-medium-gray text-sm">Bay {appt.bay_id}</p>
              </div>
              <StatusBadge status={appt.status} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-medium-gray">No upcoming appointments.</p>
      )}
    </div>
  );
}