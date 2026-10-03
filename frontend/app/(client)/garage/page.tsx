"use client";

import { useEffect, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { carsService, Car } from "@/services/cars.service";
import { appointmentsService, Appointment } from "@/services/appointments.service";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

type CarFormState = { make: string; model: string; year: string; plate: string; mileage: string };
const EMPTY_FORM: CarFormState = { make: "", model: "", year: "", plate: "", mileage: "" };

function toForm(car: Car): CarFormState {
  return {
    make: car.make,
    model: car.model,
    year: String(car.year),
    plate: car.plate,
    mileage: String(car.mileage),
  };
}

function validate(form: CarFormState): string | null {
  if (!form.make.trim()) return "Enter the make.";
  if (!form.model.trim()) return "Enter the model.";
  const year = Number(form.year);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return "Enter a valid year.";
  if (!form.plate.trim()) return "Enter the plate number.";
  const mileage = Number(form.mileage);
  if (!Number.isInteger(mileage) || mileage < 0) return "Enter a valid mileage.";
  return null;
}

const inputClass =
  "w-full border border-light-gray focus:border-black outline-none rounded-sm px-4 py-3 transition-colors";

function CarForm({
  form,
  setForm,
}: {
  form: CarFormState;
  setForm: (f: CarFormState) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <input placeholder="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className={inputClass} />
      <input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass} />
      <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass} />
      <input placeholder="Plate" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className={inputClass} />
      <input type="number" placeholder="Mileage, km" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} className={inputClass} />
    </div>
  );
}

export default function GaragePage() {
  useDocumentTitle("Garage");

  const [cars, setCars] = useState<Car[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<CarFormState>(EMPTY_FORM);
  const [addError, setAddError] = useState<string | null>(null);
  const [savingAdd, setSavingAdd] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CarFormState>(EMPTY_FORM);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function load() {
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

  useEffect(load, []);

  function submitAdd() {
    const err = validate(addForm);
    if (err) return setAddError(err);
    setAddError(null);
    setSavingAdd(true);
    carsService
      .create({
        make: addForm.make.trim(),
        model: addForm.model.trim(),
        year: Number(addForm.year),
        plate: addForm.plate.trim(),
        mileage: Number(addForm.mileage),
      })
      .then((created) => {
        setCars((prev) => [...prev, created]);
        setAddForm(EMPTY_FORM);
        setAdding(false);
      })
      .catch((err: Error) => setAddError(err.message))
      .finally(() => setSavingAdd(false));
  }

  function startEdit(car: Car) {
    setEditingId(car.id);
    setEditForm(toForm(car));
    setEditError(null);
  }

  function submitEdit(id: number) {
    const err = validate(editForm);
    if (err) return setEditError(err);
    setEditError(null);
    setSavingEdit(true);
    carsService
      .update(id, {
        make: editForm.make.trim(),
        model: editForm.model.trim(),
        year: Number(editForm.year),
        plate: editForm.plate.trim(),
        mileage: Number(editForm.mileage),
      })
      .then((updated) => {
        setCars((prev) => prev.map((c) => (c.id === id ? updated : c)));
        setEditingId(null);
      })
      .catch((err: Error) => setEditError(err.message))
      .finally(() => setSavingEdit(false));
  }

  function handleDelete(id: number) {
    if (!window.confirm("Remove this vehicle? This can't be undone.")) return;
    setDeletingId(id);
    setDeleteError(null);
    carsService
      .remove(id)
      .then(() => setCars((prev) => prev.filter((c) => c.id !== id)))
      .catch((err: Error) => setDeleteError(err.message))
      .finally(() => setDeletingId(null));
  }

  if (loading) {
    return (
      <div className="pb-24">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-9 w-56 mb-10" />
        <Skeleton className="h-28 w-full mb-4" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-uppercase text-medium-gray mb-2">My Garage</p>
          <h1 className="text-4xl font-bold">
            {cars.length} {cars.length === 1 ? "Vehicle" : "Vehicles"}
          </h1>
        </div>
        {!adding && (
          <Button variant="secondary" size="md" onClick={() => setAdding(true)}>
            Add Vehicle
          </Button>
        )}
      </div>

      {adding && (
        <div className="border border-light-gray rounded-md p-6 mb-8">
          <p className="label-uppercase text-medium-gray mb-4">New vehicle</p>
          <CarForm form={addForm} setForm={setAddForm} />
          {addError && <p className="text-accent-red text-sm mb-4">{addError}</p>}
          <div className="flex gap-3">
            <Button variant="primary" size="md" onClick={submitAdd} disabled={savingAdd}>
              {savingAdd ? "Saving..." : "Save vehicle"}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setAdding(false);
                setAddForm(EMPTY_FORM);
                setAddError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {deleteError && <p className="text-accent-red text-sm mb-6">{deleteError}</p>}

      {cars.length === 0 && !adding ? (
        <div className="py-16 text-center text-medium-gray">
          No vehicles yet.{" "}
          <button onClick={() => setAdding(true)} className="underline text-black">
            Add your first vehicle
          </button>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {cars.map((car) => {
            const completedForCar = appointments
              .filter((a) => a.car_id === car.id && a.status === "completed")
              .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
            const isEditing = editingId === car.id;

            return (
              <div key={car.id} className="border border-light-gray rounded-md p-6">
                {isEditing ? (
                  <>
                    <CarForm form={editForm} setForm={setEditForm} />
                    {editError && <p className="text-accent-red text-sm mb-4">{editError}</p>}
                    <div className="flex gap-3">
                      <Button variant="primary" size="sm" onClick={() => submitEdit(car.id)} disabled={savingEdit}>
                        {savingEdit ? "Saving..." : "Save changes"}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {car.make} {car.model}
                        </h2>
                        <p className="text-medium-gray">
                          {car.year} / {car.mileage.toLocaleString()} KM / {car.plate}
                        </p>
                      </div>
                      <div className="flex gap-4 shrink-0">
                        <button
                          onClick={() => startEdit(car)}
                          className="label-uppercase text-medium-gray hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          disabled={deletingId === car.id}
                          className="label-uppercase text-accent-red hover:opacity-70 transition-opacity disabled:opacity-40"
                        >
                          {deletingId === car.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>

                    {completedForCar.length > 0 && (
                      <div className="border-t border-light-gray pt-4 mt-4">
                        <p className="label-uppercase text-medium-gray mb-3">Service History</p>
                        <div className="flex flex-col">
                          {completedForCar.map((appt, i) => (
                            <div
                              key={appt.id}
                              className={`flex items-center gap-6 py-3 ${
                                i !== completedForCar.length - 1 ? "border-b border-light-gray" : ""
                              }`}
                            >
                              <p className="label-uppercase text-medium-gray w-24 shrink-0 text-xs">
                                {new Date(appt.start_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                              <p className="flex-1 text-sm">{appt.complaint || "Service completed"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}