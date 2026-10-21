import { Appointment } from "@/services/appointments.service";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { mediaUrl } from "@/lib/format";

interface Props {
  appointment: Appointment;
  onCancel?: (id: number) => void;
  cancelling?: boolean;
  onPhotoChange?: (id: number, file: File) => void;
  onPhotoRemove?: (id: number) => void;
  photoBusy?: boolean;
}

export function AppointmentCard({
  appointment,
  onCancel,
  cancelling,
  onPhotoChange,
  onPhotoRemove,
  photoBusy,
}: Props) {
  const date = new Date(appointment.start_at);
  const canCancel = ["pending", "confirmed"].includes(appointment.status);
  const canEditPhoto = canCancel && !!onPhotoChange;
  const photo = mediaUrl(appointment.photo_url);

  return (
    <div className="border border-light-gray rounded-md p-6">
      <div className="flex items-center justify-between gap-6">
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

      {(photo || canEditPhoto) && (
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-light-gray">
          {photo && (
            <a href={photo} target="_blank" rel="noreferrer" aria-label="Open photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt="Photo of the problem"
                className="w-16 h-16 object-cover rounded-sm border border-light-gray"
              />
            </a>
          )}
          {canEditPhoto && (
            <>
              <label className="label-uppercase text-medium-gray hover:text-black cursor-pointer transition-colors">
                {photoBusy ? "Uploading..." : photo ? "Change photo" : "Add photo of the problem"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={photoBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) onPhotoChange?.(appointment.id, file);
                  }}
                />
              </label>
              {photo && onPhotoRemove && (
                <button
                  onClick={() => onPhotoRemove(appointment.id)}
                  disabled={photoBusy}
                  className="label-uppercase text-medium-gray hover:text-accent-red transition-colors disabled:opacity-40"
                >
                  Remove
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
