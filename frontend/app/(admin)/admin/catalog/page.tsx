"use client";

import { useEffect, useState } from "react";
import { servicesService, ServiceItem } from "@/services/services.service";
import { baysService, Bay } from "@/services/bays.service";

const inputClass =
  "w-full bg-transparent border border-dark-gray focus:border-white outline-none rounded-md px-4 py-3 transition-colors";
const primaryBtn =
  "label-uppercase bg-white text-black px-6 py-3 hover:bg-light-gray transition-colors disabled:opacity-40";

export default function AdminCatalogPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bays, setBays] = useState<Bay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceName, setServiceName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [duration, setDuration] = useState("");
  const [savingService, setSavingService] = useState(false);

  const [bayName, setBayName] = useState("");
  const [savingBay, setSavingBay] = useState(false);

  function load() {
    return Promise.all([servicesService.list(), baysService.list()])
      .then(([s, b]) => {
        setServices(s);
        setBays(b);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function addService() {
    const price = Number(basePrice);
    const mins = Number(duration);
    if (!serviceName.trim()) return setError("Enter a service name.");
    if (!(price > 0)) return setError("Base price must be greater than 0.");
    if (!Number.isInteger(mins) || mins <= 0) return setError("Duration must be a whole number of minutes.");

    setError(null);
    setSavingService(true);
    servicesService
      .create({ name: serviceName.trim(), base_price: price, duration_minutes: mins })
      .then((created) => {
        setServices((prev) => [...prev, created]);
        setServiceName("");
        setBasePrice("");
        setDuration("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSavingService(false));
  }

  function addBay() {
    if (!bayName.trim()) return setError("Enter a bay name.");
    setError(null);
    setSavingBay(true);
    baysService
      .create({ name: bayName.trim() })
      .then((created) => {
        setBays((prev) => [...prev, created]);
        setBayName("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSavingBay(false));
  }

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="label-uppercase text-medium-gray mb-2">Autocare / Admin</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">CATALOG</h1>

      {error && (
        <p className="border border-accent-red rounded-md px-4 py-3 mb-8">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Services */}
        <section>
          <p className="label-uppercase text-medium-gray mb-4">Services · {services.length}</p>
          <div className="border-t border-dark-gray mb-6">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3 border-b border-dark-gray"
              >
                <p>{s.name}</p>
                <p className="font-mono text-sm text-medium-gray">
                  {Number(s.base_price).toFixed(2)} · {s.duration_minutes} min
                </p>
              </div>
            ))}
            {services.length === 0 && <p className="text-medium-gray py-4">No services yet.</p>}
          </div>

          <div className="border border-dark-gray rounded-md p-5">
            <p className="label-uppercase text-medium-gray mb-4">Add service</p>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Base price"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Minutes"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button onClick={addService} disabled={savingService} className={primaryBtn}>
                {savingService ? "Adding..." : "Add service"}
              </button>
            </div>
          </div>
        </section>

        {/* Bays */}
        <section>
          <p className="label-uppercase text-medium-gray mb-4">Bays · {bays.length}</p>
          <div className="border-t border-dark-gray mb-6">
            {bays.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-3 border-b border-dark-gray"
              >
                <p>{b.name}</p>
                <p className="label-uppercase text-xs text-medium-gray">
                  {b.is_active ? "Active" : "Offline"}
                </p>
              </div>
            ))}
            {bays.length === 0 && <p className="text-medium-gray py-4">No bays yet.</p>}
          </div>

          <div className="border border-dark-gray rounded-md p-5">
            <p className="label-uppercase text-medium-gray mb-4">Add bay</p>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Name (e.g. Bay 3)"
                value={bayName}
                onChange={(e) => setBayName(e.target.value)}
                className={inputClass}
              />
              <button onClick={addBay} disabled={savingBay} className={primaryBtn}>
                {savingBay ? "Adding..." : "Add bay"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}