import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function Progress({ value, className, indicatorColor = "bg-gradient-to-r from-fuchsia-500 to-pink-500", ...props }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800", className)}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 ease-out rounded-full", indicatorColor)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
