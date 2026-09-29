"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { carsService, Car } from "@/services/cars.service";
import { servicesService, ServiceItem } from "@/services/services.service";
import { baysService, Bay } from "@/services/bays.service";
import { appointmentsService } from "@/services/appointments.service";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function BookServicePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bays, setBays] = useState<Bay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [selectedBayId, setSelectedBayId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [complaint, setComplaint] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadCatalog() {
    setLoading(true);
    setLoadError(null);
    Promise.all([
      carsService.list(),
      servicesService.list(),
      baysService.list(),
    ])
      .then(([carsData, servicesData, baysData]) => {
        setCars(carsData);
        setServices(servicesData);
        setBays(baysData.filter((b) => b.is_active));
        if (carsData.length === 1) setSelectedCarId(carsData[0].id);
      })
      .catch(setLoadError)
      .finally(() => setLoading(false));
  }

  useEffect(loadCatalog, []);

  const selectedCar = cars.find((c) => c.id === selectedCarId);
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedBay = bays.find((b) => b.id === selectedBayId);

  async function handleConfirm() {
    if (
      !selectedCarId ||
      !selectedServiceId ||
      !selectedBayId ||
      !selectedDate ||
      !selectedTime
    )
      return;
    setError(null);
    setSubmitting(true);
    try {
      const startAt = new Date(
        `${selectedDate}T${selectedTime}:00`,
      ).toISOString();
      await appointmentsService.create({
        car_id: selectedCarId,
        service_id: selectedServiceId,
        bay_id: selectedBayId,
        start_at: startAt,
        complaint: complaint || undefined,
      });
      router.push("/appointments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="pb-24 max-w-3xl mx-auto">
        <Skeleton className="h-3 w-24 mb-3 mx-auto" />
        <Skeleton className="h-8 w-64 mb-12 mx-auto" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (loadError) return <ErrorState error={loadError} onRetry={loadCatalog} />;

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <p className="label-uppercase text-medium-gray mb-2 text-center">
        Autocare
      </p>
      <h1 className="text-3xl font-bold mb-12 text-center">BOOK A SERVICE</h1>

      <BookingStepper current={step} />

      {step === 0 && (
        <div className="flex flex-col gap-4">
          {cars.length === 0 && (
            <p className="text-medium-gray">No vehicles in your garage.</p>
          )}
          {cars.map((car) => (
            <button
              key={car.id}
              onClick={() => setSelectedCarId(car.id)}
              className={cn(
                "text-left border rounded-md p-6 transition-colors",
                selectedCarId === car.id
                  ? "border-black"
                  : "border-light-gray hover:border-medium-gray",
              )}
            >
              <p className="text-xl font-medium">
                {car.make} {car.model}
              </p>
              <p className="text-medium-gray text-sm">
                {car.year} / {car.mileage.toLocaleString()} KM
              </p>
            </button>
          ))}
          <Button
            variant="primary"
            size="lg"
            disabled={!selectedCarId}
            onClick={() => setStep(1)}
            className="mt-4"
          >
            Continue
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedServiceId(service.id)}
              className={cn(
                "text-left border rounded-md p-6 flex justify-between items-center transition-colors",
                selectedServiceId === service.id
                  ? "border-black"
                  : "border-light-gray hover:border-medium-gray",
              )}
            >
              <div>
                <p className="text-lg font-medium">{service.name}</p>
                <p className="text-medium-gray text-sm">
                  {service.duration_minutes} min
                </p>
              </div>
              <p className="text-lg">${service.base_price}</p>
            </button>
          ))}
          <div className="flex gap-4 mt-4">
            <Button variant="secondary" size="lg" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedServiceId}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="label-uppercase text-medium-gray mb-3">Date</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="border border-light-gray px-4 py-3 rounded-sm w-full focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <p className="label-uppercase text-medium-gray mb-3">Time</p>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="border border-light-gray px-4 py-3 rounded-sm w-full focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <p className="label-uppercase text-medium-gray mb-3">Bay</p>
            <div className="flex gap-3 flex-wrap">
              {bays.map((bay) => (
                <button
                  key={bay.id}
                  onClick={() => setSelectedBayId(bay.id)}
                  className={cn(
                    "px-5 py-3 border rounded-sm label-uppercase transition-colors",
                    selectedBayId === bay.id
                      ? "border-black bg-black text-white"
                      : "border-light-gray",
                  )}
                >
                  {bay.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label-uppercase text-medium-gray mb-3">
              Notes (optional)
            </p>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={3}
              className="border border-light-gray px-4 py-3 rounded-sm w-full focus:outline-none focus:border-black resize-none"
              placeholder="Describe the issue..."
            />
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedDate || !selectedTime || !selectedBayId}
              onClick={() => setStep(3)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="border border-light-gray rounded-md p-8 flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="text-medium-gray">Vehicle</span>
              <span className="font-medium">
                {selectedCar?.make} {selectedCar?.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-medium-gray">Service</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-medium-gray">Date & Time</span>
              <span className="font-medium">
                {selectedDate} {selectedTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-medium-gray">Bay</span>
              <span className="font-medium">{selectedBay?.name}</span>
            </div>
            <div className="flex justify-between border-t border-light-gray pt-4">
              <span className="text-medium-gray">Estimated Price</span>
              <span className="font-medium">
                ${selectedService?.base_price}
              </span>
            </div>
          </div>
          {error && <p className="text-accent-red text-sm">{error}</p>}
          <div className="flex gap-4">
            <Button variant="secondary" size="lg" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
