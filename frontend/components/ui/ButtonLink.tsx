import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: "accent" | "outline-light";
  size?: "md" | "lg";
}

/** Ссылка в виде кнопки (без вложенного <button> внутри <a>). */
export function ButtonLink({ variant = "accent", size = "lg", className, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime",
        variant === "accent" && "bg-lime text-night hover:bg-lime-hover",
        variant === "outline-light" &&
          "border border-line text-fg font-medium hover:border-fg-muted hover:bg-surface",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        className
      )}
      {...props}
    />
  );
}
