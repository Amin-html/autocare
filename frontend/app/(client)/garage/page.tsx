"use client";

import { useEffect, useState } from "react";
import { carsService, Car } from "@/services/cars.service";
import { appointmentsService, Appointment } from "@/services/appointments.service";

export default function GaragePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([carsService.list(), appointmentsService.my()])
      .then(([carsData, apptsData]) => {
        setCars(carsData);
        setAppointments(apptsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  const car = cars[0];

  if (!car) {
    return (
      <div className="py-24 text-center">
        <p className="text-medium-gray mb-4">No vehicles in your garage yet.</p>
      </div>
    );
  }

  const completedForCar = appointments
    .filter((a) => a.car_id === car.id && a.status === "completed")
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  return (
    <div className="pb-24">
      <p className="label-uppercase text-medium-gray mb-2">My Garage</p>
      <h1 className="text-4xl font-bold mb-1">{car.make} {car.model}</h1>
      <p className="text-medium-gray mb-10">{car.year} / {car.mileage.toLocaleString()} KM</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16 border-y border-light-gray py-8">
        <div>
          <p className="label-uppercase text-medium-gray mb-1">Make</p>
          <p className="text-lg">{car.make}</p>
        </div>
        <div>
          <p className="label-uppercase text-medium-gray mb-1">Model</p>
          <p className="text-lg">{car.model}</p>
        </div>
        <div>
          <p className="label-uppercase text-medium-gray mb-1">Year</p>
          <p className="text-lg">{car.year}</p>
        </div>
        <div>
          <p className="label-uppercase text-medium-gray mb-1">Plate</p>
          <p className="text-lg">{car.plate}</p>
        </div>
        <div>
          <p className="label-uppercase text-medium-gray mb-1">Mileage</p>
          <p className="text-lg">{car.mileage.toLocaleString()} KM</p>
        </div>
      </div>

      <p className="label-uppercase text-medium-gray mb-6">Service History</p>
      {completedForCar.length > 0 ? (
        <div className="flex flex-col">
          {completedForCar.map((appt, i) => (
            <div
              key={appt.id}
              className={`flex items-center gap-6 py-5 ${
                i !== completedForCar.length - 1 ? "border-b border-light-gray" : ""
              }`}
            >
              <p className="label-uppercase text-medium-gray w-24 shrink-0">
                {new Date(appt.start_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="flex-1">{appt.complaint || "Service completed"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-medium-gray">No completed services yet.</p>
      )}
    </div>
  );
}