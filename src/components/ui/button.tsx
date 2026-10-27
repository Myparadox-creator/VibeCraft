import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none rounded-xl";

    const variants = {
      primary:
        "bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-md shadow-fuchsia-950/40 focus:ring-fuchsia-500 border border-fuchsia-400/20",
      glow:
        "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-glow hover:shadow-fuchsia-500/40 focus:ring-fuchsia-500 border border-white/20 active:scale-95",
      secondary:
        "bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/60 focus:ring-slate-400",
      outline:
        "border border-slate-700/80 bg-transparent hover:bg-slate-800/60 text-slate-200 focus:ring-fuchsia-500",
      ghost:
        "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white focus:ring-slate-400",
      danger:
        "bg-red-600/90 hover:bg-red-600 text-white focus:ring-red-500 shadow-sm border border-red-500/20",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-10 gap-2",
      lg: "text-base px-6 py-3 h-12 gap-2.5",
      icon: "h-10 w-10 p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
