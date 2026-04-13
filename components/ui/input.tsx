"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[color:rgba(111,90,66,0.58)] focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]/30",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
