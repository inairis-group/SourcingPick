import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 px-3 text-base",
  lg: "h-11 px-3.5 text-md",
};

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  inputSize?: Size;
  invalid?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { inputSize = "md", invalid, leftSlot, rightSlot, className, disabled, ...rest },
  ref,
) {
  if (leftSlot || rightSlot) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-sm border bg-surface transition-colors duration-fast",
          "focus-within:border-focus focus-within:outline-2 focus-within:outline-focus focus-within:outline-offset-2",
          invalid ? "border-danger" : "border-line-strong",
          disabled && "bg-subtle cursor-not-allowed",
          sizeClasses[inputSize],
          className,
        )}
      >
        {leftSlot && <span className="text-faint flex-shrink-0">{leftSlot}</span>}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className="flex-1 bg-transparent text-fg placeholder:text-faint outline-none min-w-0"
          {...rest}
        />
        {rightSlot && <span className="text-faint flex-shrink-0">{rightSlot}</span>}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-sm border bg-surface text-fg placeholder:text-faint",
        "transition-colors duration-fast",
        "focus:outline-2 focus:outline-focus focus:outline-offset-2",
        invalid ? "border-danger focus:border-danger" : "border-line-strong focus:border-focus",
        disabled && "bg-subtle cursor-not-allowed",
        sizeClasses[inputSize],
        className,
      )}
      {...rest}
    />
  );
});
