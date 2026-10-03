"use client";

import { useEffect, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { servicesService, ServiceItem } from "@/services/services.service";
import { baysService, Bay } from "@/services/bays.service";

const inputClass =
  "w-full bg-transparent border border-dark-gray focus:border-white outline-none rounded-md px-4 py-3 transition-colors";
const primaryBtn =
  "label-uppercase bg-white text-black px-6 py-3 hover:bg-light-gray transition-colors disabled:opacity-40";
const ghostBtn =
  "label-uppercase text-medium-gray hover:text-white transition-colors";

export default function AdminCatalogPage() {
  useDocumentTitle("Catalog");

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

  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceEditForm, setServiceEditForm] = useState({ name: "", base_price: "", duration_minutes: "" });
  const [savingServiceEdit, setSavingServiceEdit] = useState(false);

  const [editingBayId, setEditingBayId] = useState<number | null>(null);
  const [bayEditName, setBayEditName] = useState("");
  const [savingBayEdit, setSavingBayEdit] = useState(false);

  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([servicesService.listAll(), baysService.listAll()])
      .then(([s, b]) => {
        setServices(s);
        setBays(b);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

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

  function startServiceEdit(s: ServiceItem) {
    setEditingServiceId(s.id);
    setServiceEditForm({ name: s.name, base_price: s.base_price, duration_minutes: String(s.duration_minutes) });
  }

  function saveServiceEdit(id: number) {
    const price = Number(serviceEditForm.base_price);
    const mins = Number(serviceEditForm.duration_minutes);
    if (!serviceEditForm.name.trim()) return setError("Enter a service name.");
    if (!(price > 0)) return setError("Base price must be greater than 0.");
    if (!Number.isInteger(mins) || mins <= 0) return setError("Duration must be a whole number of minutes.");

    setError(null);
    setSavingServiceEdit(true);
    servicesService
      .update(id, { name: serviceEditForm.name.trim(), base_price: price, duration_minutes: mins })
      .then((updated) => {
        setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setEditingServiceId(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSavingServiceEdit(false));
  }

  function toggleServiceActive(s: ServiceItem) {
    setBusyId(`svc-${s.id}`);
    setError(null);
    servicesService
      .update(s.id, { is_active: !s.is_active })
      .then((updated) => setServices((prev) => prev.map((x) => (x.id === s.id ? updated : x))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setBusyId(null));
  }

  function deleteService(id: number) {
    if (!window.confirm("Delete this service? This can't be undone.")) return;
    setBusyId(`svc-${id}`);
    setError(null);
    servicesService
      .remove(id)
      .then(() => setServices((prev) => prev.filter((s) => s.id !== id)))
      .catch((err: Error) => setError(err.message))
      .finally(() => setBusyId(null));
  }

  function startBayEdit(b: Bay) {
    setEditingBayId(b.id);
    setBayEditName(b.name);
  }

  function saveBayEdit(id: number) {
    if (!bayEditName.trim()) return setError("Enter a bay name.");
    setError(null);
    setSavingBayEdit(true);
    baysService
      .update(id, { name: bayEditName.trim() })
      .then((updated) => {
        setBays((prev) => prev.map((b) => (b.id === id ? updated : b)));
        setEditingBayId(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSavingBayEdit(false));
  }

  function toggleBayActive(b: Bay) {
    setBusyId(`bay-${b.id}`);
    setError(null);
    baysService
      .update(b.id, { is_active: !b.is_active })
      .then((updated) => setBays((prev) => prev.map((x) => (x.id === b.id ? updated : x))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setBusyId(null));
  }

  function deleteBay(id: number) {
    if (!window.confirm("Delete this bay? This can't be undone.")) return;
    setBusyId(`bay-${id}`);
    setError(null);
    baysService
      .remove(id)
      .then(() => setBays((prev) => prev.filter((b) => b.id !== id)))
      .catch((err: Error) => setError(err.message))
      .finally(() => setBusyId(null));
  }

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="label-uppercase text-medium-gray mb-2">Autocare / Admin</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">CATALOG</h1>

      {error && <p className="border border-accent-red rounded-md px-4 py-3 mb-8">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Services */}
        <section>
          <p className="label-uppercase text-medium-gray mb-4">Services · {services.length}</p>
          <div className="border-t border-dark-gray mb-6">
            {services.map((s) => (
              <div key={s.id} className="py-3 border-b border-dark-gray">
                {editingServiceId === s.id ? (
                  <div className="flex flex-col gap-2 py-2">
                    <input
                      value={serviceEditForm.name}
                      onChange={(e) => setServiceEditForm({ ...serviceEditForm, name: e.target.value })}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={serviceEditForm.base_price}
                        onChange={(e) => setServiceEditForm({ ...serviceEditForm, base_price: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="number"
                        value={serviceEditForm.duration_minutes}
                        onChange={(e) => setServiceEditForm({ ...serviceEditForm, duration_minutes: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex gap-3 mt-1">
                      <button onClick={() => saveServiceEdit(s.id)} disabled={savingServiceEdit} className={primaryBtn}>
                        {savingServiceEdit ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditingServiceId(null)} className={ghostBtn}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className={s.is_active ? "" : "opacity-40"}>
                      <p>{s.name}</p>
                      <p className="font-mono text-sm text-medium-gray">
                        {Number(s.base_price).toFixed(2)} · {s.duration_minutes} min
                        {!s.is_active && " · inactive"}
                      </p>
                    </div>
                    <div className="flex gap-4 shrink-0 text-xs">
                      <button onClick={() => startServiceEdit(s)} className={ghostBtn}>
                        Edit
                      </button>
                      <button
                        onClick={() => toggleServiceActive(s)}
                        disabled={busyId === `svc-${s.id}`}
                        className={ghostBtn}
                      >
                        {s.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteService(s.id)}
                        disabled={busyId === `svc-${s.id}`}
                        className="label-uppercase text-accent-red hover:opacity-70 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
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
              <div key={b.id} className="py-3 border-b border-dark-gray">
                {editingBayId === b.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={bayEditName}
                      onChange={(e) => setBayEditName(e.target.value)}
                      className={inputClass}
                    />
                    <button onClick={() => saveBayEdit(b.id)} disabled={savingBayEdit} className={primaryBtn}>
                      Save
                    </button>
                    <button onClick={() => setEditingBayId(null)} className={ghostBtn}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className={b.is_active ? "" : "opacity-40"}>{b.name}</p>
                    <div className="flex gap-4 shrink-0 text-xs items-center">
                      <span className="label-uppercase text-medium-gray">
                        {b.is_active ? "Active" : "Offline"}
                      </span>
                      <button onClick={() => startBayEdit(b)} className={ghostBtn}>
                        Edit
                      </button>
                      <button
                        onClick={() => toggleBayActive(b)}
                        disabled={busyId === `bay-${b.id}`}
                        className={ghostBtn}
                      >
                        {b.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteBay(b.id)}
                        disabled={busyId === `bay-${b.id}`}
                        className="label-uppercase text-accent-red hover:opacity-70 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
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