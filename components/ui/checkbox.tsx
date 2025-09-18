import * as React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
        className={
          "form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out border-gray-300 rounded " +
          (props.className || "")
        }
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
