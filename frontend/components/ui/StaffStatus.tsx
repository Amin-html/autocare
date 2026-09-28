import { AppointmentStatus } from "@/services/appointments.service";

const STAFF_STATUS: Record<AppointmentStatus, { label: string; badge: string }> = {
  pending: { label: "Pending", badge: "border border-dark-gray text-medium-gray" },
  confirmed: { label: "Confirmed", badge: "bg-white text-black" },
  in_progress: { label: "In progress", badge: "bg-accent-red text-white" },
  completed: { label: "Completed", badge: "bg-dark-gray text-white" },
  cancelled: { label: "Cancelled", badge: "border border-dark-gray text-medium-gray" },
};

export function StaffStatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STAFF_STATUS[status];
  return (
    <span
      className={`inline-block px-3 py-1 text-xs uppercase tracking-wide rounded-sm whitespace-nowrap ${s.badge}`}
    >
      {s.label}
    </span>
  );
}