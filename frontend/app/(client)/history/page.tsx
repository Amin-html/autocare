"use client";

import { useEffect, useState } from "react";
import { appointmentsService, Appointment } from "@/services/appointments.service";
import { carsService, Car } from "@/services/cars.service";

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentsService.my(), carsService.list()])
      .then(([apptsData, carsData]) => {
        setAppointments(apptsData);
        setCars(carsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  const completed = appointments
    .filter((a) => a.status === "completed")
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  function carLabel(carId: number) {
    const car = cars.find((c) => c.id === carId);
    return car ? `${car.make} ${car.model}` : null;
  }

  return (
    <div className="pb-24 max-w-2xl">
      <p className="label-uppercase text-medium-gray mb-2">Autocare</p>
      <h1 className="text-3xl font-bold mb-12">SERVICE HISTORY</h1>

      {completed.length === 0 ? (
        <p className="text-medium-gray py-12">No completed services yet.</p>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-[3px] top-2 bottom-2 w-px bg-light-gray" />
          <div className="flex flex-col gap-10">
            {completed.map((appt) => {
              const date = new Date(appt.start_at);
              return (
                <div key={appt.id} className="relative">
                  <span className="absolute -left-8 top-1.5 w-2 h-2 rounded-full bg-black" />
                  <p className="label-uppercase text-medium-gray mb-1">
                    {date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase()}
                  </p>
                  <p className="text-lg font-medium">
                    {appt.complaint || "Service completed"}
                  </p>
                  {carLabel(appt.car_id) && (
                    <p className="text-medium-gray text-sm mt-1">{carLabel(appt.car_id)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}