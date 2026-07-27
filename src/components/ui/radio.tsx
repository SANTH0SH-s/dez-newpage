import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, name, ...props }, ref) => {
    const defaultId = React.useId();
    const radioId = id || defaultId;

    return (
      <div className="flex items-start space-x-3 select-none">
        <div className="flex h-5 items-center">
          <input
            type="radio"
            id={radioId}
            name={name}
            ref={ref}
            className={twMerge(
              "appearance-none h-5 w-5 rounded-full border border-gray-300 bg-white checked:bg-dezprox-accent checked:border-dezprox-accent focus:outline-none focus:ring-4 focus:ring-dezprox-accent/20 cursor-pointer transition-all duration-200 relative flex items-center justify-center after:content-[''] after:absolute after:hidden checked:after:block after:w-[9px] after:h-[9px] after:rounded-full after:bg-dezprox-primary",
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <label htmlFor={radioId} className="flex flex-col cursor-pointer">
            {label && (
              <span className="font-sans text-base font-semibold text-dezprox-text leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="font-sans text-xs text-gray-500 mt-1 leading-normal">
                {description}
              </span>
            )}
          </label>
        )}
      </div>
    );
  }
);
Radio.displayName = "Radio";
