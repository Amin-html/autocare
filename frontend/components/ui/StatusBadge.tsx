import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "PENDING", className: "bg-light-gray text-black" },
  confirmed: { label: "CONFIRMED", className: "bg-black text-white" },
  in_progress: { label: "IN PROGRESS", className: "bg-accent-red text-white" },
  completed: { label: "COMPLETED", className: "bg-dark-gray text-white" },
  cancelled: { label: "CANCELLED", className: "bg-light-gray text-medium-gray" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 text-xs font-medium uppercase tracking-wide rounded-sm",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}