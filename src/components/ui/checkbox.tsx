import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, onCheckedChange, onChange, ...props }, ref) => {
    const defaultId = React.useId();
    const checkboxId = id || defaultId;

    const handleCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <div className="flex items-start space-x-3 select-none">
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            onChange={handleCheckedChange}
            className={twMerge(
              "appearance-none h-5 w-5 rounded border border-gray-300 bg-white checked:bg-dezprox-accent checked:border-dezprox-accent focus:outline-none focus:ring-4 focus:ring-dezprox-accent/20 cursor-pointer transition-all duration-200 relative flex items-center justify-center after:content-[''] after:absolute after:hidden checked:after:block after:w-[5px] after:h-[9px] after:border-r-[2px] after:border-b-[2px] after:border-dezprox-primary after:rotate-45 after:translate-y-[-1px] after:translate-x-[0.25px]",
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <label htmlFor={checkboxId} className="flex flex-col cursor-pointer">
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
Checkbox.displayName = "Checkbox";
