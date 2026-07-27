import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "accent" | "outline";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold font-sans tracking-wide transition-colors",
        variant === "default" && "bg-dezprox-primary text-white",
        variant === "secondary" && "bg-gray-100 text-dezprox-primary",
        variant === "accent" && "bg-dezprox-accent/15 text-dezprox-primary border border-dezprox-accent/20",
        variant === "outline" && "border border-gray-200 text-gray-500 bg-transparent",
        className
      )}
      {...props}
    />
  );
};
