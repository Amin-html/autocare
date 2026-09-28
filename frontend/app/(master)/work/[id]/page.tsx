"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { appointmentsService, Appointment } from "@/services/appointments.service";
import { carsService, Car } from "@/services/cars.service";
import { servicesService, ServiceItem } from "@/services/services.service";
import { workOrdersService, WorkOrder } from "@/services/work-orders.service";
import { StaffStatusBadge } from "@/components/ui/StaffStatus";
import { fmtWhen } from "@/lib/format";

const inputClass =
  "w-full bg-transparent border border-dark-gray focus:border-white outline-none rounded-md px-4 py-3 transition-colors";
const primaryBtn =
  "label-uppercase bg-white text-black px-6 py-3 hover:bg-light-gray transition-colors disabled:opacity-40";

function money(v: string | number) {
  return Number(v).toFixed(2);
}

export default function WorkOrderPage() {
  const params = useParams<{ id: string }>();
  const appointmentId = Number(params.id);

  const [appt, setAppt] = useState<Appointment | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [service, setService] = useState<ServiceItem | null>(null);
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [mileage, setMileage] = useState("");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  const load = useCallback(() => {
    return appointmentsService
      .assigned()
      .then(async (list) => {
        const found = list.find((a) => a.id === appointmentId);
        if (!found) {
          setNotFound(true);
          return;
        }
        const [cars, services, existing] = await Promise.all([
          carsService.listAll(),
          servicesService.list(),
          workOrdersService.byAppointment(found.id),
        ]);
        const foundCar = cars.find((c) => c.id === found.car_id) ?? null;
        setAppt(found);
        setCar(foundCar);
        setService(services.find((s) => s.id === found.service_id) ?? null);
        setOrder(existing);
        setMileage((prev) => prev || (foundCar ? String(foundCar.mileage) : ""));
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function startWork() {
    if (!appt) return;
    run(() => appointmentsService.start(appt.id));
  }

  function createOrder() {
    if (!appt) return;
    const value = Number(mileage);
    if (mileage.trim() === "" || !Number.isInteger(value) || value < 0) {
      setActionError("Enter a valid mileage (whole number).");
      return;
    }
    if (car && value < car.mileage) {
      setActionError(`Mileage cannot be lower than the last recorded value (${car.mileage} km).`);
      return;
    }
    run(() => workOrdersService.create(appt.id, value));
  }

  function addItem() {
    if (!order) return;
    const qty = Number(quantity);
    const price = Number(unitPrice);
    if (!title.trim()) return setActionError("Enter a work title.");
    if (!Number.isInteger(qty) || qty < 1) return setActionError("Quantity must be at least 1.");
    if (!(price > 0)) return setActionError("Price must be greater than 0.");

    run(async () => {
      await workOrdersService.addItem(order.id, {
        title: title.trim(),
        quantity: qty,
        unit_price: price,
      });
      setTitle("");
      setQuantity("1");
      setUnitPrice("");
    });
  }

  function closeOrder() {
    if (!order) return;
    if (!window.confirm("Close this work order? It cannot be changed afterwards.")) return;
    run(() => workOrdersService.close(order.id));
  }

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  if (notFound || !appt) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="label-uppercase text-medium-gray mb-2">{error ? "Error" : "Not found"}</p>
        <p className="mb-6">{error ?? "This job is not assigned to you."}</p>
        <Link href="/work" className="label-uppercase underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const isOpen = order?.status === "open";
  const isClosed = order?.status === "closed";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/work" className="label-uppercase text-medium-gray hover:text-white transition-colors">
        ← All jobs
      </Link>

      {/* Job header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-8 mb-10">
        <div>
          <p className="font-mono text-sm text-medium-gray mb-2">
            {fmtWhen(appt.start_at, appt.end_at)} · Bay {appt.bay_id}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {car ? `${car.make} ${car.model}` : `Car #${appt.car_id}`}
          </h1>
          <p className="text-medium-gray mt-2">
            {service?.name ?? `Service #${appt.service_id}`}
            {car && <span className="font-mono ml-3">{car.plate}</span>}
          </p>
          {appt.complaint && <p className="text-sm text-medium-gray mt-3">“{appt.complaint}”</p>}
        </div>
        <StaffStatusBadge status={appt.status} />
      </div>

      {error && (
        <p className="border border-accent-red rounded-md px-4 py-3 mb-6">{error}</p>
      )}
      {actionError && (
        <p className="border border-accent-red rounded-md px-4 py-3 mb-6">{actionError}</p>
      )}

      {/* Not started yet */}
      {appt.status === "confirmed" && (
        <div className="border border-dark-gray rounded-md p-8">
          <p className="label-uppercase text-medium-gray mb-3">Ready to start</p>
          <p className="mb-6 text-medium-gray">
            Start the job to record mileage and open the work order.
          </p>
          <button onClick={startWork} disabled={busy} className={primaryBtn}>
            {busy ? "Starting..." : "Start work"}
          </button>
        </div>
      )}

      {(appt.status === "pending" || appt.status === "cancelled") && (
        <p className="text-medium-gray">This job is not ready for work.</p>
      )}

      {/* In progress, no order yet */}
      {appt.status === "in_progress" && !order && (
        <div className="border border-dark-gray rounded-md p-8">
          <p className="label-uppercase text-medium-gray mb-3">Open work order</p>
          <label className="block text-sm text-medium-gray mb-2" htmlFor="mileage">
            Current mileage, km{car ? ` (last recorded: ${car.mileage})` : ""}
          </label>
          <input
            id="mileage"
            type="number"
            min={0}
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className={`${inputClass} max-w-xs mb-6`}
          />
          <div>
            <button onClick={createOrder} disabled={busy} className={primaryBtn}>
              {busy ? "Creating..." : "Create work order"}
            </button>
          </div>
        </div>
      )}

      {/* Work order */}
      {order && (
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <p className="label-uppercase text-medium-gray">
              Work order #{order.id} · {order.mileage} km
            </p>
            <p className="label-uppercase text-medium-gray">{isClosed ? "Closed" : "Open"}</p>
          </div>

          <div className="border-t border-dark-gray">
            {order.items.length === 0 ? (
              <p className="text-medium-gray py-6">No work items yet.</p>
            ) : (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_80px_120px_120px] gap-4 py-4 border-b border-dark-gray items-center"
                >
                  <p className="min-w-0 truncate">{item.title}</p>
                  <p className="hidden md:block font-mono text-sm text-medium-gray">
                    × {item.quantity}
                  </p>
                  <p className="hidden md:block font-mono text-sm text-medium-gray text-right">
                    {money(item.unit_price)}
                  </p>
                  <p className="font-mono text-right">
                    {money(Number(item.unit_price) * item.quantity)}
                  </p>
                </div>
              ))
            )}

            <div className="flex items-baseline justify-between py-6">
              <p className="label-uppercase text-medium-gray">Total</p>
              <p className="text-3xl font-bold tabular-nums">{money(order.total)}</p>
            </div>
          </div>

          {isOpen && appt.status === "in_progress" && (
            <>
              <div className="border border-dark-gray rounded-md p-6 mt-4">
                <p className="label-uppercase text-medium-gray mb-4">Add work item</p>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_140px_auto] gap-3">
                  <input
                    placeholder="Title (e.g. Oil change)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Unit price"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className={inputClass}
                  />
                  <button onClick={addItem} disabled={busy} className={primaryBtn}>
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={closeOrder}
                  disabled={busy || order.items.length === 0}
                  className="label-uppercase bg-accent-red text-white px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Close work order
                </button>
              </div>
            </>
          )}

          {isClosed && (
            <p className="text-medium-gray mt-2">
              This work order is closed and can no longer be changed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}