import { cn } from "@/lib/utils";

export function Skeleton({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        dark ? "bg-dark-gray" : "bg-light-gray",
        className
      )}
    />
  );
}