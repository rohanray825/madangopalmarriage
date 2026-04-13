"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-3xl border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[color:rgba(111,90,66,0.58)] focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]/30",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
