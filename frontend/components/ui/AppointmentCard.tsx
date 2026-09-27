import { Appointment } from "@/services/appointments.service";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

interface Props {
  appointment: Appointment;
  onCancel?: (id: number) => void;
  cancelling?: boolean;
}

export function AppointmentCard({ appointment, onCancel, cancelling }: Props) {
  const date = new Date(appointment.start_at);
  const canCancel = ["pending", "confirmed"].includes(appointment.status);

  return (
    <div className="border border-light-gray rounded-md p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-8">
        <div className="text-center shrink-0">
          <p className="text-2xl font-bold leading-none">
            {date.toLocaleDateString("en-US", { day: "2-digit" })}
          </p>
          <p className="label-uppercase text-medium-gray">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </p>
        </div>
        <div>
          <p className="font-medium">
            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-medium-gray text-sm">Bay {appointment.bay_id}</p>
          {appointment.complaint && (
            <p className="text-medium-gray text-sm mt-1">{appointment.complaint}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <StatusBadge status={appointment.status} />
        {canCancel && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(appointment.id)}
            disabled={cancelling}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}