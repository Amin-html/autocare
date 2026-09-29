"use client";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";

function describeError(error: unknown): { title: string; message: string } {
  const status = error instanceof ApiError ? error.status : undefined;
  const detail = error instanceof Error ? error.message : undefined;

    switch (status) {
    case 0:
        return {
        title: "Offline",
        message: detail || "Can't reach the server. Check your connection and try again.",
        };
    case 403:
        return { title: "No access", message: detail || "You don't have permission to view this." };
    case 404:
        return { title: "Not found", message: detail || "This item doesn't exist or was removed." };
    case 401:
        return { title: "Session expired", message: "Please sign in again." };
    default:
        return { title: "Something went wrong", message: detail || "Please try again in a moment." };
    }
}

export function ErrorState({
  error,
  onRetry,
  dark,
}: {
  error: unknown;
  onRetry?: () => void;
  dark?: boolean;
}) {
  const { title, message } = describeError(error);
  return (
    <div className={cn("text-center py-16 border rounded-md", dark ? "border-dark-gray" : "border-light-gray")}>
      <p className="label-uppercase text-medium-gray mb-2">{title}</p>
      <p className={cn("mb-6", dark ? "text-white" : "text-black")}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "label-uppercase px-6 py-3 border transition-colors",
            dark
              ? "border-white text-white hover:bg-white hover:text-black"
              : "border-black text-black hover:bg-black hover:text-white"
          )}
        >
          Retry
        </button>
      )}
    </div>
  );
}