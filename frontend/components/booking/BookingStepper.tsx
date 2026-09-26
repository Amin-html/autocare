import { cn } from "@/lib/utils";

const steps = ["Select Vehicle", "Select Service", "Date & Time", "Confirm"];

export function BookingStepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-4 mb-16">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium shrink-0",
                i <= current ? "bg-black text-white" : "bg-light-gray text-medium-gray"
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "label-uppercase hidden md:inline",
                i <= current ? "text-black" : "text-medium-gray"
              )}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("h-px flex-1", i < current ? "bg-black" : "bg-light-gray")} />
          )}
        </div>
      ))}
    </div>
  );
}